import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { executeQuery } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          // Buscar usuario por email
          const users = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [credentials.email])

          if (users.length === 0) {
            console.log("Usuario no encontrado:", credentials.email)
            return null
          }

          const user = users[0]

          // Verificar si el usuario está activo
          if (user.estado !== "activo") {
            console.log("Usuario no activo:", user.email, "Estado:", user.estado)
            throw new Error("EmailNotVerified")
          }

          // Verificar contraseña
          const isValid = await bcrypt.compare(credentials.password, user.password_hash)

          if (!isValid) {
            console.log("Contraseña incorrecta para:", user.email)
            return null
          }

          console.log("Inicio de sesión exitoso para:", user.email)

          // Devolver objeto de usuario para JWT
          return {
            id: user.id,
            name: `${user.nombre} ${user.apellido}`,
            email: user.email,
            image: user.imagen_perfil,
            role: user.rol,
          }
        } catch (error) {
          console.error("Error en authorize:", error)
          throw error
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Para inicio de sesión con credenciales, siempre permitir
      if (account?.provider === "credentials") {
        return true
      }

      // Para Google, continuar con el proceso normal
      if (!user.email) {
        console.error("No email provided by Google")
        return false
      }

      try {
        console.log("Google Sign In - User Data:", JSON.stringify(user))
        console.log("Google Sign In - Account Data:", JSON.stringify(account))

        // Determinar el rol basado en el dominio de correo
        const role = user.email.endsWith("@uabc.edu.mx") ? "administrador" : "usuario"
        console.log(`Asignando rol ${role} para ${user.email}`)

        // Verificar si el usuario ya existe en la base de datos
        const existingUser = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [user.email])
        console.log(`Usuarios encontrados con email ${user.email}:`, existingUser.length)

        if (existingUser.length === 0) {
          // Crear nuevo usuario
          console.log(`Creando nuevo usuario para ${user.email} con rol ${role}`)

          // Dividir el nombre completo en nombre y apellido
          const firstName = user.name?.split(" ")[0] || ""
          const lastName = user.name?.split(" ").slice(1).join(" ") || ""

          console.log(`Nombre: ${firstName}, Apellido: ${lastName}`)

          // Insertar el nuevo usuario
          const insertResult = await executeQuery(
            `INSERT INTO usuarios 
             (nombre, apellido, email, imagen_perfil, rol, google_id, estado, fecha_registro, email_verified) 
             VALUES ($1, $2, $3, $4, $5, $6, 'activo', NOW(), true)
             RETURNING id`,
            [
              firstName,
              lastName,
              user.email,
              user.image || "",
              role,
              account?.providerAccountId || "", // Guardar el ID de Google
            ],
          )

          console.log("Usuario insertado con ID:", insertResult[0]?.id)

          if (!insertResult || insertResult.length === 0) {
            console.error("No se pudo insertar el usuario en la base de datos")
            // Permitir el inicio de sesión pero registrar el error
            return true
          }
        } else {
          // Actualizar información del usuario existente
          console.log(`Actualizando usuario existente para ${user.email}`)

          // Dividir el nombre completo en nombre y apellido
          const firstName = user.name?.split(" ")[0] || ""
          const lastName = user.name?.split(" ").slice(1).join(" ") || ""

          const updateResult = await executeQuery(
            `UPDATE usuarios 
             SET nombre = $1, 
                 apellido = $2, 
                 imagen_perfil = $3, 
                 google_id = $4,
                 rol = $5,
                 email_verified = true
             WHERE email = $6
             RETURNING id`,
            [
              firstName,
              lastName,
              user.image || "",
              account?.providerAccountId || "",
              role, // Asegurar que el rol se actualice correctamente
              user.email,
            ],
          )

          console.log("Usuario actualizado con ID:", updateResult[0]?.id)

          if (!updateResult || updateResult.length === 0) {
            console.error("No se pudo actualizar el usuario en la base de datos")
            // Permitir el inicio de sesión pero registrar el error
            return true
          }
        }

        // Verificar que el usuario se haya guardado correctamente
        const verifyUser = await executeQuery("SELECT * FROM usuarios WHERE email = $1", [user.email])
        console.log(`Verificación: Usuario con email ${user.email} existe:`, verifyUser.length > 0)

        return true
      } catch (error) {
        console.error("Error en signIn callback:", error)
        // Permitir el inicio de sesión incluso si hay un error en la base de datos
        // pero registrar el error para depuración
        return true
      }
    },
    async jwt({ token, user, account, trigger }) {
      console.log("JWT Callback - Trigger:", trigger)

      // Si es un inicio de sesión o una actualización forzada, actualizar el token
      if (user || trigger === "update") {
        try {
          if (user?.email) {
            console.log(`JWT: Obteniendo información para ${user.email}`)

            // Obtener información actualizada del usuario desde la base de datos
            const dbUser = await executeQuery("SELECT id, rol FROM usuarios WHERE email = $1", [user.email])

            if (dbUser.length > 0) {
              console.log(`Usuario encontrado en DB: ${JSON.stringify(dbUser[0])}`)
              token.id = dbUser[0].id
              token.role = dbUser[0].rol
            } else {
              console.log(`Usuario no encontrado en DB, asignando valores predeterminados`)
              token.id = user.id || "temp-id"
              token.role = user.role || (user.email?.endsWith("@uabc.edu.mx") ? "administrador" : "usuario")
            }
          } else if (trigger === "update" && token.email) {
            console.log(`JWT Update: Actualizando token para ${token.email}`)

            const dbUser = await executeQuery("SELECT id, rol FROM usuarios WHERE email = $1", [token.email])

            if (dbUser.length > 0) {
              console.log(`Usuario encontrado en DB durante actualización: ${JSON.stringify(dbUser[0])}`)
              token.id = dbUser[0].id
              token.role = dbUser[0].rol
            }
          }
        } catch (error) {
          console.error("Error en jwt callback:", error)

          // Asignar valores predeterminados en caso de error
          if (user?.email) {
            token.id = user.id || "temp-id"
            token.role = user.role || (user.email?.endsWith("@uabc.edu.mx") ? "administrador" : "usuario")
          }
        }
      }

      return token
    },
    async session({ session, token }) {
      console.log("Session Callback - Token:", JSON.stringify(token))

      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string

        console.log("Session Updated:", JSON.stringify(session))
      }

      return session
    },
  },
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 días
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
}

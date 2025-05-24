// Sistema de autenticación simulado para la aplicación
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Modificar la definición de User para incluir password
export type User = {
  id: string
  name: string
  email: string
  image?: string
  role: "administrador" | "usuario"
  password?: string // Añadimos el campo password
}

// Modificar los usuarios de prueba para incluir contraseñas
const mockUsers: User[] = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@example.com",
    image: "/admin-interface.png",
    role: "administrador",
    password: "admin123",
  },
  {
    id: "2",
    name: "Regular User",
    email: "user@example.com",
    image: "/abstract-geometric-shapes.png",
    role: "usuario",
    password: "user123",
  },
  {
    id: "3",
    name: "Leo Baslo",
    email: "leobaslo.inide@gmail.com",
    image: "/abstract-geometric-shapes.png",
    role: "usuario",
    password: "Tecate15",
  },
]

// Modificar la función login para que verifique también la contraseña
export async function login(email: string, password?: string): Promise<User | null> {
  const user = mockUsers.find((u) => u.email === email)

  if (!user) {
    return null
  }

  // Si se proporciona una contraseña, verificarla
  if (password && user.password !== password) {
    return null
  }

  // Guardar el ID del usuario en una cookie
  cookies().set("user-id", user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // 1 semana
    path: "/",
  })

  // No devolver la contraseña al cliente
  const { password: _, ...userWithoutPassword } = user
  return userWithoutPassword
}

export async function logout() {
  cookies().delete("user-id")
}

export async function getSession(): Promise<{ user: User } | null> {
  try {
    const userId = cookies().get("user-id")?.value

    if (!userId) {
      return null
    }

    const user = mockUsers.find((u) => u.id === userId)

    if (!user) {
      return null
    }

    return { user }
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

// Función para proteger rutas que requieren autenticación
export async function requireAuth(redirectTo = "/login") {
  try {
    const session = await getSession()

    if (!session) {
      redirect(redirectTo)
    }

    return session.user
  } catch (error) {
    console.error("Error in requireAuth:", error)
    redirect(redirectTo)
  }
}

// Función para proteger rutas que requieren rol de administrador
export async function requireAdmin(redirectTo = "/") {
  try {
    const session = await getSession()

    if (!session || session.user.role !== "administrador") {
      redirect(redirectTo)
    }

    return session.user
  } catch (error) {
    console.error("Error in requireAdmin:", error)
    redirect(redirectTo)
  }
}

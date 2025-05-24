import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
  try {
    console.log("GET /api/users - Starting request")

    // Verificar autenticación (opcional para este endpoint)
    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Usar la columna estado en lugar de activo
    const query = `
      SELECT id, nombre, apellido, email, rol, estado
      FROM usuarios
      ORDER BY nombre, apellido
    `

    console.log("Executing query:", query)
    const users = await executeQuery(query)
    console.log("Query executed successfully, found", users.length, "users")

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al obtener usuarios",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const { nombre, apellido, email, password, rol } = data

    // Validar datos
    if (!nombre || !apellido || !email || !password) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar si el email ya existe
    const existingUser = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [email])
    if (existingUser.length > 0) {
      return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 })
    }

    // Crear el usuario usando estado en lugar de activo
    const result = await executeQuery(
      `
      INSERT INTO usuarios (nombre, apellido, email, password, rol, estado)
      VALUES ($1, $2, $3, $4, $5, 'activo')
      RETURNING id
    `,
      [nombre, apellido, email, password, rol || "usuario"],
    )

    return NextResponse.json({ id: result[0].id, message: "Usuario creado correctamente" })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Error al crear el usuario" }, { status: 500 })
  }
}

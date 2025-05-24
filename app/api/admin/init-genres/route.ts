import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

// Lista de géneros predefinidos
const generosPredefinidos = [
  "Novela de ficción",
  "Ciencia ficción",
  "Fantasía",
  "Misterio",
  "Thriller / Suspenso",
  "Romance",
  "Terror / Horror",
  "Aventura",
  "Histórica",
  "Drama",
  "Biografía",
  "Autobiografía",
  "Memorias",
  "Poesía",
  "Ensayo",
  "Crónica",
  "Literatura infantil",
  "Literatura juvenil",
  "Autoayuda / Desarrollo personal",
]

export async function GET() {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Insertar géneros predefinidos si no existen
    let insertados = 0
    for (const genero of generosPredefinidos) {
      // Verificar si el género ya existe
      const existente = await executeQuery(`SELECT id FROM generos WHERE nombre = $1`, [genero])

      if (existente.length === 0) {
        // Insertar el género si no existe
        await executeQuery(`INSERT INTO generos (nombre) VALUES ($1)`, [genero])
        insertados++
      }
    }

    // Obtener todos los géneros actuales
    const generos = await executeQuery(`SELECT * FROM generos ORDER BY nombre`)

    return NextResponse.json({
      success: true,
      message: `${insertados} géneros insertados. ${generos.length} géneros en total.`,
      generos,
    })
  } catch (error: any) {
    console.error("Error al inicializar géneros:", error)
    return NextResponse.json(
      {
        error: `Error al inicializar géneros: ${error.message}`,
      },
      { status: 500 },
    )
  }
}

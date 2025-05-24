import { type NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

// GET para obtener un libro específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const forceInclude = url.searchParams.get("forceInclude") === "true"

    // Obtener detalles del libro
    const bookResult = await executeQuery(
      `
    SELECT l.*, 
           (SELECT string_agg(g.nombre, ', ') 
            FROM libros_generos lg 
            JOIN generos g ON lg.genero_id = g.id 
            WHERE lg.libro_id = l.id) as generos
    FROM libros l
    WHERE l.id = $1 ${!forceInclude ? "AND l.activo = true" : ""}
  `,
      [id],
    )

    if (bookResult.length === 0) {
      return NextResponse.json({ error: "Libro no encontrado" }, { status: 404 })
    }

    // Obtener reseñas (simuladas por ahora)
    const reviews = [
      { user: "Juan P.", rating: 5, comment: "Un clásico imprescindible que todos deberían leer." },
      {
        user: "María L.",
        rating: 4,
        comment: "Bellamente escrito con temas importantes que siguen resonando hoy en día.",
      },
    ]

    const book = {
      ...bookResult[0],
      reviews,
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error("Error fetching book:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

// PUT para actualizar un libro
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    const body = await request.json()
    console.log(`Actualizando libro con ID: ${id}`, body)

    const {
      titulo,
      autor,
      anio_publicacion,
      editorial,
      isbn,
      descripcion,
      copias_totales,
      copias_disponibles,
      generos,
      portada_url,
      activo,
      paginas,
    } = body

    // Validar datos requeridos
    if (!titulo || !autor || !anio_publicacion) {
      return NextResponse.json({ error: "Título, autor y año de publicación son obligatorios" }, { status: 400 })
    }

    try {
      // Actualizar el libro
      console.log("Ejecutando actualización en la base de datos...")
      await executeQuery(
        `
      UPDATE libros
      SET titulo = $1, 
          autor = $2, 
          anio_publicacion = $3, 
          editorial = $4, 
          isbn = $5, 
          descripcion = $6, 
          copias_totales = $7, 
          copias_disponibles = $8, 
          portada_url = $9,
          activo = $10,
          paginas = $11
      WHERE id = $12
      `,
        [
          titulo,
          autor,
          anio_publicacion,
          editorial || null,
          isbn || null,
          descripcion || null,
          copias_totales,
          copias_disponibles,
          portada_url,
          activo,
          paginas || null,
          id,
        ],
      )
      console.log("Libro actualizado correctamente")

      // Si hay géneros, actualizar las relaciones
      if (generos) {
        console.log(`Actualizando ${generos.length} géneros...`)

        // Primero eliminar todas las relaciones existentes
        console.log("Eliminando relaciones de géneros existentes...")
        await executeQuery(`DELETE FROM libros_generos WHERE libro_id = $1`, [id])

        // Luego insertar las nuevas relaciones
        for (const genero of generos) {
          console.log(`Procesando género: ${genero}`)

          // Verificar si el género existe
          const generoExistente = await executeQuery(`SELECT id FROM generos WHERE nombre = $1`, [genero])

          let generoId
          if (generoExistente.length === 0) {
            // Crear el género si no existe
            console.log(`Creando nuevo género: ${genero}`)
            const nuevoGenero = await executeQuery(`INSERT INTO generos (nombre) VALUES ($1) RETURNING id`, [genero])
            generoId = nuevoGenero[0].id
          } else {
            generoId = generoExistente[0].id
            console.log(`Género existente con ID: ${generoId}`)
          }

          // Crear la relación libro-género
          console.log(`Creando relación libro-género: ${id} - ${generoId}`)
          await executeQuery(`INSERT INTO libros_generos (libro_id, genero_id) VALUES ($1, $2)`, [id, generoId])
        }
      }

      return NextResponse.json({ success: true })
    } catch (dbError: any) {
      console.error("Error en la base de datos:", dbError)
      return NextResponse.json(
        {
          error: `Error en la base de datos: ${dbError.message}`,
          details: dbError,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error updating book:", error)
    return NextResponse.json(
      {
        error: `Error updating book: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}

// DELETE para eliminar un libro
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const id = params.id
    console.log(`Eliminando libro con ID: ${id}`)

    // Verificar si el libro tiene préstamos activos
    console.log("Verificando préstamos activos...")
    const prestamos = await executeQuery(
      `SELECT COUNT(*) as count FROM prestamos WHERE libro_id = $1 AND estado = 'activo'`,
      [id],
    )

    if (prestamos[0].count > 0) {
      console.log(`El libro tiene ${prestamos[0].count} préstamos activos, no se puede eliminar`)
      return NextResponse.json(
        { error: "No se puede eliminar el libro porque tiene préstamos activos" },
        { status: 400 },
      )
    }

    try {
      // Primero eliminar las relaciones con géneros
      console.log("Eliminando relaciones de géneros...")
      await executeQuery(`DELETE FROM libros_generos WHERE libro_id = $1`, [id])

      // Luego eliminar el libro
      console.log("Eliminando libro...")
      await executeQuery(`DELETE FROM libros WHERE id = $1`, [id])

      console.log("Libro eliminado correctamente")
      return NextResponse.json({ success: true })
    } catch (dbError: any) {
      console.error("Error en la base de datos:", dbError)
      return NextResponse.json(
        {
          error: `Error en la base de datos: ${dbError.message}`,
          details: dbError,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error deleting book:", error)
    return NextResponse.json(
      {
        error: `Error deleting book: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}

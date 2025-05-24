import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
  try {
    console.log("GET /api/books - Starting request")

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const includeAll = url.searchParams.get("includeAll") === "true"

    // Obtener todos los libros con sus géneros
    const query = `
    SELECT l.*, 
           (SELECT string_agg(g.nombre, ', ') 
            FROM generos g 
            JOIN libros_generos lg ON g.id = lg.genero_id 
            WHERE lg.libro_id = l.id) AS generos
    FROM libros l
    ${!includeAll ? "WHERE l.activo = true" : ""}
    ORDER BY l.titulo
  `

    console.log("Executing query:", query)
    const books = await executeQuery(query)
    console.log("Books result:", books.length, "books found")

    return NextResponse.json(books)
  } catch (error) {
    console.error("Error fetching books:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al obtener libros",
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
    const {
      titulo,
      autor,
      editorial,
      anio_publicacion,
      isbn,
      descripcion,
      idioma,
      paginas,
      copias_totales,
      copias_disponibles,
      portada_url,
      generos,
    } = data

    // Validar datos
    if (!titulo || !autor || !anio_publicacion) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Crear el libro
    const result = await executeQuery(
      `
    INSERT INTO libros (
      titulo, autor, editorial, anio_publicacion, isbn, descripcion, 
      idioma, paginas, copias_totales, copias_disponibles, portada_url, activo
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
    RETURNING id
  `,
      [
        titulo,
        autor,
        editorial || null,
        anio_publicacion,
        isbn || null,
        descripcion || null,
        idioma || null,
        paginas || null,
        copias_totales || 1,
        copias_disponibles || copias_totales || 1,
        portada_url || null,
      ],
    )

    const libroId = result[0].id

    // Si hay géneros, crear las relaciones
    if (generos && Array.isArray(generos) && generos.length > 0) {
      for (const genero of generos) {
        // Verificar si el género existe
        let generoId
        const generoResult = await executeQuery("SELECT id FROM generos WHERE nombre = $1", [genero])

        if (generoResult.length > 0) {
          generoId = generoResult[0].id
        } else {
          // Crear el género si no existe
          const newGeneroResult = await executeQuery("INSERT INTO generos (nombre) VALUES ($1) RETURNING id", [genero])
          generoId = newGeneroResult[0].id
        }

        // Crear la relación
        await executeQuery("INSERT INTO libros_generos (libro_id, genero_id) VALUES ($1, $2)", [libroId, generoId])
      }
    }

    return NextResponse.json({ id: libroId, message: "Libro creado correctamente" })
  } catch (error) {
    console.error("Error creating book:", error)
    return NextResponse.json({ error: "Error al crear el libro" }, { status: 500 })
  }
}

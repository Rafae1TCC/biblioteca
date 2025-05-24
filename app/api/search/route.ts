import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const query = url.searchParams.get("q")

    if (!query || query.trim() === "") {
      return NextResponse.json({ results: [] })
    }

    // Search in titles, authors, and descriptions
    const searchTerm = `%${query}%`
    const results = await executeQuery(
      `SELECT 
        l.id, 
        l.titulo, 
        l.autor, 
        l.descripcion, 
        l.portada_url, 
        l.imagen_portada,
        l.copias_disponibles,
        (SELECT string_agg(g.nombre, ', ') 
         FROM libros_generos lg 
         JOIN generos g ON lg.genero_id = g.id 
         WHERE lg.libro_id = l.id) as generos
      FROM libros l
      WHERE 
        l.activo = true AND
        (
          LOWER(l.titulo) LIKE LOWER($1) OR
          LOWER(l.autor) LIKE LOWER($1) OR
          LOWER(l.descripcion) LIKE LOWER($1)
        )
      ORDER BY 
        CASE 
          WHEN LOWER(l.titulo) LIKE LOWER($1) THEN 0
          WHEN LOWER(l.autor) LIKE LOWER($1) THEN 1
          ELSE 2
        END,
        l.titulo
      LIMIT 5`,
      [searchTerm],
    )

    return NextResponse.json({ results })
  } catch (error) {
    console.error("Error searching books:", error)
    return NextResponse.json({ error: "Error al buscar libros" }, { status: 500 })
  }
}

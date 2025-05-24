import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    console.log(`Obteniendo lista de deseos para ${session.user.email}`)

    // Obtener el ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      console.log(`Usuario no encontrado para ${session.user.email}`)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const userId = userResult[0].id
    console.log(`ID de usuario encontrado: ${userId}`)

    // Obtener la lista de deseos con información de los libros
    // Usando el formato solicitado, similar al de reservas
    const wishlistResult = await executeQuery(
      `SELECT ld.*, l.titulo, l.autor, l.imagen_portada, l.portada_url, l.copias_disponibles
       FROM lista_deseos ld
       JOIN libros l ON ld.libro_id = l.id
       WHERE ld.usuario_id = $1
       ORDER BY ld.fecha_agregado DESC`,
      [userId],
    )

    console.log(`Se encontraron ${wishlistResult.length} libros en la lista de deseos`)

    return NextResponse.json({ wishlist: wishlistResult })
  } catch (error) {
    console.error("Error al obtener la lista de deseos:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

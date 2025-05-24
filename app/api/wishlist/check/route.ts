import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user) {
      return NextResponse.json({ inWishlist: false })
    }

    const url = new URL(request.url)
    const bookId = url.searchParams.get("bookId")

    if (!bookId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario de la base de datos
    const users = await executeQuery(`SELECT id FROM usuarios WHERE email = $1`, [session.user.email])

    if (!users || users.length === 0) {
      return NextResponse.json({ inWishlist: false })
    }

    const userId = users[0].id

    // Verificar si el libro está en la lista de deseos
    const wishlistItems = await executeQuery(`SELECT * FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2`, [
      userId,
      bookId,
    ])

    return NextResponse.json({ inWishlist: wishlistItems && wishlistItems.length > 0 })
  } catch (error) {
    console.error("Error al verificar la lista de deseos:", error)
    return NextResponse.json({ inWishlist: false })
  }
}

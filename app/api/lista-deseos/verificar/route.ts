import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-config"
import { executeQuery } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ isInWishlist: false })
    }

    const url = new URL(request.url)
    const libroId = url.searchParams.get("libroId")

    if (!libroId) {
      return NextResponse.json({ error: "ID del libro requerido" }, { status: 400 })
    }

    // Obtener el ID del usuario
    const userResult = await executeQuery("SELECT id FROM usuarios WHERE email = $1", [session.user.email])

    if (userResult.length === 0) {
      return NextResponse.json({ isInWishlist: false })
    }

    const userId = userResult[0].id

    // Verificar si el libro está en la lista de deseos
    const wishlistResult = await executeQuery("SELECT * FROM lista_deseos WHERE usuario_id = $1 AND libro_id = $2", [
      userId,
      libroId,
    ])

    return NextResponse.json({ isInWishlist: wishlistResult.length > 0 })
  } catch (error) {
    console.error("Error al verificar lista de deseos:", error)
    return NextResponse.json({ isInWishlist: false })
  }
}

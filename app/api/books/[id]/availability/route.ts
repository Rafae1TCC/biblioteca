import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// PATCH para actualizar solo la disponibilidad de un libro
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { copias_disponibles } = body

    await executeQuery(
      `
      UPDATE libros
      SET copias_disponibles = $1
      WHERE id = $2
      `,
      [copias_disponibles, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating book availability:", error)
    return NextResponse.json({ error: "Error updating book availability" }, { status: 500 })
  }
}

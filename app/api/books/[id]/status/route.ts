import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

// PATCH para actualizar solo el estado activo/inactivo de un libro
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    const { activo } = body

    await executeQuery(
      `
      UPDATE libros
      SET activo = $1
      WHERE id = $2
      `,
      [activo, id],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating book status:", error)
    return NextResponse.json({ error: "Error updating book status" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function GET() {
  try {
    const genres = await executeQuery(`
      SELECT * FROM generos
      ORDER BY nombre
    `)
    return NextResponse.json({ genres })
  } catch (error) {
    console.error("Error fetching genres:", error)
    return NextResponse.json({ error: "Error fetching genres" }, { status: 500 })
  }
}

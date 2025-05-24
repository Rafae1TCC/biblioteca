import { login } from "@/lib/mock-auth"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    const user = await login(email)

    if (user) {
      return NextResponse.json({ success: true, user })
    } else {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 401 })
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: "Error en el servidor" }, { status: 500 })
  }
}
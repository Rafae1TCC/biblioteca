import { logout } from "@/lib/mock-auth"
import { NextResponse } from "next/server"

export async function POST() {
  await logout()
  return NextResponse.json({ success: true })
}

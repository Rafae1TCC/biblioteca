import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  try {
    // Permitir siempre las rutas de autenticación
    if (request.nextUrl.pathname.startsWith("/api/auth") || request.nextUrl.pathname.startsWith("/auth")) {
      return NextResponse.next()
    }

    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

    // Si no hay usuario, redirigir a login
    if (!token) {
      const url = new URL("/login", request.url)
      url.searchParams.set("callbackUrl", request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    // Para rutas de administrador, verificar si el usuario es admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
      // Verificar si el usuario tiene rol de administrador
      if (token.role !== "administrador") {
        return NextResponse.redirect(new URL("/", request.url))
      }

      // Redirigir de /admin a /admin/books
      if (request.nextUrl.pathname === "/admin") {
        return NextResponse.redirect(new URL("/admin/books", request.url))
      }
    }

    // Actualizar redirecciones y manejo de rutas
    if (request.nextUrl.pathname.startsWith("/catalog")) {
      const url = request.nextUrl.pathname.replace("/catalog", "/catalogo")
      return NextResponse.redirect(new URL(url, request.url))
    }

    if (request.nextUrl.pathname.startsWith("/user/dashboard")) {
      const url = request.nextUrl.pathname.replace("/user/dashboard", "/usuario/dashboard")
      return NextResponse.redirect(new URL(url, request.url))
    }

    if (request.nextUrl.pathname.startsWith("/user/wishlist")) {
      const url = request.nextUrl.pathname.replace("/user/wishlist", "/usuario/lista-deseos")
      return NextResponse.redirect(new URL(url, request.url))
    }

    if (request.nextUrl.pathname.startsWith("/iniciar-sesion")) {
      const url = request.nextUrl.pathname.replace("/iniciar-sesion", "/login")
      return NextResponse.redirect(new URL(url, request.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)
    // En caso de error, permitir la solicitud para evitar bloqueos
    return NextResponse.next()
  }
}

export const config = {
  matcher: ["/admin/:path*", "/usuario/:path*"],
}

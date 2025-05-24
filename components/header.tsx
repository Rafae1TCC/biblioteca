import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { UserNav } from "@/components/user-nav"

interface HeaderProps {
  isAdminPage?: boolean
}

export async function Header({ isAdminPage = false }: HeaderProps) {
  const session = await getServerSession(authOptions)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <a href="#contenido-principal" className="skip-to-content">
        Saltar al contenido principal
      </a>
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="h-6 w-6" />
          <span>BibliotecaHub</span>
        </Link>
        <nav className="hidden md:flex gap-6">
          <Link href="/catalogo" className="text-muted-foreground hover:text-foreground transition-colors">
            Catálogo
          </Link>
          {!isAdminPage && (
            <>
              <Link href="/sobre-nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
                Sobre Nosotros
              </Link>
              <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
                Contacto
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {session ? (
            <UserNav />
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="hidden sm:inline-flex">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/login">
                <Button className="hidden sm:inline-flex">Registrarse</Button>
              </Link>
            </>
          )}
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menú">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
          </Button>
        </div>
      </div>
    </header>
  )
}

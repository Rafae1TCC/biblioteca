"use client"

import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { UserNav } from "@/components/user-nav"

export function ClientHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session } = useSession()

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
          <Link href="/sobre-nosotros" className="text-muted-foreground hover:text-foreground transition-colors">
            Sobre Nosotros
          </Link>
          <Link href="/contacto" className="text-muted-foreground hover:text-foreground transition-colors">
            Contacto
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {session ? (
            <UserNav />
          ) : (
            <>
              <Link href="/auth/signin">
                <Button variant="outline" className="hidden sm:inline-flex">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button className="hidden sm:inline-flex">Registrarse</Button>
              </Link>
            </>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
          >
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
              {isMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="18" x2="20" y2="18" />
                </>
              )}
            </svg>
          </Button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden p-4 border-t border-border/50 bg-background">
          <nav className="flex flex-col space-y-4">
            <Link href="/catalogo" className="text-foreground hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/sobre-nosotros" className="text-foreground hover:text-primary transition-colors">
              Sobre Nosotros
            </Link>
            <Link href="/contacto" className="text-foreground hover:text-primary transition-colors">
              Contacto
            </Link>
            {!session && (
              <div className="flex flex-col space-y-2 pt-2 border-t border-border/50">
                <Link href="/auth/signin">
                  <Button variant="outline" className="w-full">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button className="w-full">Registrarse</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

import Link from "next/link"

export function Footer() {
  return (
    <footer className="w-full border-t py-6 bg-muted/30">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-center text-sm text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} BibliotecaHub. Todos los derechos reservados.
        </p>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link href="/terminos" className="hover:underline">
            Términos
          </Link>
          <Link href="/privacidad" className="hover:underline">
            Privacidad
          </Link>
          <Link href="/contacto" className="hover:underline">
            Contacto
          </Link>
        </nav>
      </div>
    </footer>
  )
}

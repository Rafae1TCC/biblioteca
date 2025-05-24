"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BookOpen, Users, ClipboardList, LogOut, BookMarked } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface AdminSidebarProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
    role?: string | null
  }
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="md:w-64 bg-muted/30 border-r border-border/50">
      <div className="p-4 border-b border-border/50 flex items-center gap-4">
        <Avatar>
          <AvatarImage src={user.image || ""} alt={user.name || "Admin"} />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.email}</p>
        </div>
      </div>
      <nav className="p-4">
        <div className="space-y-1">
          <Link href="/admin/books">
            <Button
              variant={pathname === "/admin/books" || pathname.startsWith("/admin/books/") ? "secondary" : "ghost"}
              className="w-full justify-start"
              size="sm"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Libros
            </Button>
          </Link>
          <Link href="/admin/users">
            <Button
              variant={pathname === "/admin/users" || pathname.startsWith("/admin/users/") ? "secondary" : "ghost"}
              className="w-full justify-start"
              size="sm"
            >
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </Button>
          </Link>
          <Link href="/admin/loans">
            <Button
              variant={pathname === "/admin/loans" || pathname.startsWith("/admin/loans/") ? "secondary" : "ghost"}
              className="w-full justify-start"
              size="sm"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Préstamos
            </Button>
          </Link>
          <Link href="/admin/reservas">
            <Button
              variant={
                pathname === "/admin/reservas" || pathname.startsWith("/admin/reservas/") ? "secondary" : "ghost"
              }
              className="w-full justify-start"
              size="sm"
            >
              <BookMarked className="mr-2 h-4 w-4" />
              Reservas
            </Button>
          </Link>
          <form action="/api/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start" size="sm" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </nav>
    </aside>
  )
}

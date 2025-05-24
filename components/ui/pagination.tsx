import type React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  totalItems: number
  itemsPerPage: number
  currentPage: number
  baseUrl: string
  queryParams?: Record<string, string>
}

export function Pagination({
  totalItems,
  itemsPerPage,
  currentPage,
  baseUrl,
  queryParams = {},
  className,
  ...props
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)

  // No mostrar paginación si solo hay una página
  if (totalPages <= 1) {
    return null
  }

  // Construir URL con parámetros de consulta
  const buildUrl = (page: number) => {
    const params = new URLSearchParams({ ...queryParams, page: page.toString() })
    return `${baseUrl}?${params.toString()}`
  }

  // Determinar qué páginas mostrar
  const getPageItems = () => {
    const items = []

    // Siempre mostrar la primera página
    items.push(<PaginationItem key="first" page={1} current={currentPage} url={buildUrl(1)} />)

    // Mostrar puntos suspensivos si la página actual está lejos del inicio
    if (currentPage > 3) {
      items.push(<PaginationEllipsis key="ellipsis-1" />)
    }

    // Mostrar páginas alrededor de la página actual
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i === 1 || i === totalPages) continue // Evitar duplicar primera y última página
      items.push(<PaginationItem key={i} page={i} current={currentPage} url={buildUrl(i)} />)
    }

    // Mostrar puntos suspensivos si la página actual está lejos del final
    if (currentPage < totalPages - 2) {
      items.push(<PaginationEllipsis key="ellipsis-2" />)
    }

    // Siempre mostrar la última página si hay más de una página
    if (totalPages > 1) {
      items.push(<PaginationItem key="last" page={totalPages} current={currentPage} url={buildUrl(totalPages)} />)
    }

    return items
  }

  return (
    <nav
      role="navigation"
      aria-label="Navegación de paginación"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    >
      <ul className="flex flex-row items-center gap-1">
        <li>
          <PaginationPrevious url={currentPage > 1 ? buildUrl(currentPage - 1) : undefined} />
        </li>
        {getPageItems()}
        <li>
          <PaginationNext url={currentPage < totalPages ? buildUrl(currentPage + 1) : undefined} />
        </li>
      </ul>
    </nav>
  )
}

interface PaginationItemProps {
  page: number
  current: number
  url: string
}

function PaginationItem({ page, current, url }: PaginationItemProps) {
  const isActive = page === current

  return (
    <li>
      <Link
        href={url}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          buttonVariants({
            variant: isActive ? "default" : "outline",
            size: "icon",
          }),
          "h-9 w-9",
          isActive && "pointer-events-none",
        )}
      >
        {page}
      </Link>
    </li>
  )
}

function PaginationEllipsis() {
  return (
    <li>
      <div
        className={cn(
          buttonVariants({
            variant: "outline",
            size: "icon",
          }),
          "h-9 w-9 cursor-default",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Más páginas</span>
      </div>
    </li>
  )
}

function PaginationPrevious({ url }: { url?: string }) {
  const Component = url ? Link : "div"

  return (
    <Component
      href={url || "#"}
      aria-disabled={!url}
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "icon",
        }),
        "h-9 w-9",
        !url && "cursor-not-allowed opacity-50 pointer-events-none",
      )}
    >
      <ChevronLeft className="h-4 w-4" />
      <span className="sr-only">Página anterior</span>
    </Component>
  )
}

function PaginationNext({ url }: { url?: string }) {
  const Component = url ? Link : "div"

  return (
    <Component
      href={url || "#"}
      aria-disabled={!url}
      className={cn(
        buttonVariants({
          variant: "outline",
          size: "icon",
        }),
        "h-9 w-9",
        !url && "cursor-not-allowed opacity-50 pointer-events-none",
      )}
    >
      <ChevronRight className="h-4 w-4" />
      <span className="sr-only">Página siguiente</span>
    </Component>
  )
}

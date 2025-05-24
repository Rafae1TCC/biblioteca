"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "@/hooks/use-debounce"

type SearchResult = {
  id: number
  titulo: string
  autor: string
  descripcion: string | null
  portada_url: string | null
  imagen_portada: string | null
  copias_disponibles: number
  generos: string | null
}

export function SearchBar() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const debouncedQuery = useDebounce(query, 300)

  // Fetch search results when query changes
  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.trim() === "") {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await response.json()
        setResults(data.results || [])
      } catch (error) {
        console.error("Error fetching search results:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    // Arrow down
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    }
    // Arrow up
    else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0))
    }
    // Enter
    else if (e.key === "Enter") {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        router.push(`/catalogo/${results[selectedIndex].id}`)
        setIsOpen(false)
      } else if (query.trim() !== "") {
        handleSearch()
      }
    }
    // Escape
    else if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  const handleSearch = () => {
    if (query.trim() !== "") {
      router.push(`/catalogo?search=${encodeURIComponent(query)}`)
      setIsOpen(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto relative" ref={searchRef}>
      <form
        className="flex space-x-2"
        onSubmit={(e) => {
          e.preventDefault()
          handleSearch()
        }}
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            className="pl-10 pr-4 py-2 w-full"
            placeholder="Buscar libros por título, autor o palabra clave..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setIsOpen(true)
              setSelectedIndex(-1)
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            aria-label="Buscar libros"
            aria-expanded={isOpen}
            aria-controls="search-results"
            aria-autocomplete="list"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>
        <Button type="submit" onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Buscar</span>
        </Button>
      </form>

      {/* Search results dropdown */}
      {isOpen && (query.trim() !== "" || results.length > 0) && (
        <div
          id="search-results"
          className="absolute z-50 mt-1 w-full bg-background border border-border rounded-md shadow-lg max-h-[70vh] overflow-y-auto"
          role="listbox"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              <Loader2 className="h-5 w-5 mx-auto animate-spin mb-2" />
              <p>Buscando...</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="p-2">
                {results.map((book, index) => (
                  <Link
                    href={`/catalogo/${book.id}`}
                    key={book.id}
                    className={`flex items-start p-2 hover:bg-muted rounded-md transition-colors ${
                      selectedIndex === index ? "bg-muted" : ""
                    }`}
                    onClick={() => setIsOpen(false)}
                    role="option"
                    aria-selected={selectedIndex === index}
                  >
                    <div className="flex-shrink-0 h-16 w-12 relative mr-3">
                      <Image
                        src={
                          book.portada_url ||
                          book.imagen_portada ||
                          `/placeholder.svg?height=96&width=64&query=Portada de ${book.titulo}`
                        }
                        alt={`Portada de ${book.titulo}`}
                        fill
                        sizes="48px"
                        className="object-cover rounded-sm"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{book.titulo}</h4>
                      <p className="text-xs text-muted-foreground truncate">{book.autor}</p>
                      {book.generos && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {book.generos
                            .split(", ")
                            .slice(0, 2)
                            .map((genero) => (
                              <Badge key={genero} variant="outline" className="text-xs px-1 py-0">
                                {genero}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                    <Badge
                      variant={book.copias_disponibles > 0 ? "default" : "secondary"}
                      className="ml-2 self-start flex-shrink-0"
                    >
                      {book.copias_disponibles > 0 ? "Disponible" : "No disponible"}
                    </Badge>
                  </Link>
                ))}
              </div>
              <div className="p-2 border-t border-border">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm text-muted-foreground"
                  onClick={handleSearch}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Ver todos los resultados para "{query}"
                </Button>
              </div>
            </>
          ) : (
            query.trim() !== "" && (
              <div className="p-4 text-center text-muted-foreground">
                <p>No se encontraron resultados para "{query}"</p>
                <Button variant="link" className="mt-1 text-sm" onClick={handleSearch}>
                  Ver catálogo completo
                </Button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  )
}

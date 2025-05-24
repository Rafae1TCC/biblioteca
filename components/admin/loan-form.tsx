"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

interface User {
  id: number
  nombre: string
  apellido: string
  email: string
  estado?: string
}

interface Book {
  id: number
  titulo: string
  autor: string
  copias_disponibles: number
  activo?: boolean
}

export function LoanForm({ loanId }: { loanId?: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isLoadingData, setIsLoadingData] = useState(true)

  const [users, setUsers] = useState<User[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [userSearch, setUserSearch] = useState("")
  const [bookSearch, setBookSearch] = useState("")

  const [formData, setFormData] = useState({
    userId: "",
    bookId: "",
    loanDate: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  })

  // Fetch users and books on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true)
      setError(null)

      try {
        console.log("Fetching users and books...")

        // Fetch users with better error handling
        try {
          const usersResponse = await fetch("/api/users")
          console.log("Users response status:", usersResponse.status)

          if (!usersResponse.ok) {
            const errorText = await usersResponse.text()
            console.error("Error response from /api/users:", errorText)
            throw new Error(`Error al cargar usuarios: ${usersResponse.status} ${errorText}`)
          }

          const usersData = await usersResponse.json()
          console.log("Users data:", usersData)

          if (!Array.isArray(usersData)) {
            console.error("Users data is not an array:", usersData)
            throw new Error("Formato de datos de usuarios inválido")
          }

          // Filter active users - using estado instead of activo
          const activeUsers = usersData.filter((user: User) => user.estado === "activo")
          console.log("Active users:", activeUsers.length)

          setUsers(activeUsers)
          setFilteredUsers(activeUsers)
        } catch (userError) {
          console.error("Error fetching users:", userError)
          throw new Error(userError instanceof Error ? userError.message : "Error al cargar usuarios")
        }

        // Fetch books with better error handling
        try {
          const booksResponse = await fetch("/api/books")
          console.log("Books response status:", booksResponse.status)

          if (!booksResponse.ok) {
            const errorText = await booksResponse.text()
            console.error("Error response from /api/books:", errorText)
            throw new Error(`Error al cargar libros: ${booksResponse.status} ${errorText}`)
          }

          const booksData = await booksResponse.json()
          console.log("Books data:", booksData)

          if (!Array.isArray(booksData)) {
            console.error("Books data is not an array:", booksData)
            throw new Error("Formato de datos de libros inválido")
          }

          // Filter available and active books
          const availableBooks = booksData.filter((book: Book) => book.copias_disponibles > 0 && book.activo !== false)
          console.log("Available books:", availableBooks.length)

          setBooks(availableBooks)
          setFilteredBooks(availableBooks)
        } catch (bookError) {
          console.error("Error fetching books:", bookError)
          throw new Error(bookError instanceof Error ? bookError.message : "Error al cargar libros")
        }

        // If editing, fetch loan data
        if (loanId) {
          try {
            const loanResponse = await fetch(`/api/loans/${loanId}`)
            console.log("Loan response status:", loanResponse.status)

            if (!loanResponse.ok) {
              const errorText = await loanResponse.text()
              console.error("Error response from /api/loans:", errorText)
              throw new Error(`Error al cargar datos del préstamo: ${loanResponse.status} ${errorText}`)
            }

            const loanData = await loanResponse.json()
            console.log("Loan data:", loanData)

            // Asegurarse de que todos los libros estén disponibles para edición
            try {
              console.log("Requesting all books for editing")
              const allBooksResponse = await fetch("/api/books?includeAll=true")

              if (allBooksResponse.ok) {
                const allBooksData = await allBooksResponse.json()
                if (Array.isArray(allBooksData)) {
                  // Filtrar solo libros activos
                  const activeBooks = allBooksData.filter((book: Book) => book.activo !== false)

                  // Asegurarse de que el libro actual esté en la lista
                  const currentBookExists = activeBooks.some((book: Book) => book.id === loanData.libro_id)

                  if (!currentBookExists) {
                    // Obtener el libro actual y agregarlo a la lista
                    const currentBookResponse = await fetch(`/api/books/${loanData.libro_id}?forceInclude=true`)
                    if (currentBookResponse.ok) {
                      const currentBookData = await currentBookResponse.json()
                      if (currentBookData.book) {
                        activeBooks.push(currentBookData.book)
                      }
                    }
                  }

                  setBooks(activeBooks)
                  setFilteredBooks(activeBooks)
                }
              }
            } catch (allBooksError) {
              console.error("Error loading all books:", allBooksError)
              // No lanzar error aquí, ya que no es crítico
            }

            setFormData({
              userId: loanData.usuario_id.toString(),
              bookId: loanData.libro_id.toString(),
              loanDate: new Date(loanData.fecha_prestamo).toISOString().split("T")[0],
              dueDate: new Date(loanData.fecha_vencimiento).toISOString().split("T")[0],
              notes: loanData.notas || "",
            })
          } catch (loanError) {
            console.error("Error fetching loan:", loanError)
            throw new Error(loanError instanceof Error ? loanError.message : "Error al cargar datos del préstamo")
          }
        }
      } catch (err) {
        console.error("Error in fetchData:", err)
        setError(err instanceof Error ? err.message : "Error al cargar datos")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchData()
  }, [loanId])

  // Filter users based on search
  useEffect(() => {
    if (userSearch) {
      const filtered = users.filter(
        (user) =>
          `${user.nombre} ${user.apellido}`.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase()),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [userSearch, users])

  // Filter books based on search
  useEffect(() => {
    if (bookSearch) {
      const filtered = books.filter(
        (book) =>
          book.titulo.toLowerCase().includes(bookSearch.toLowerCase()) ||
          book.autor.toLowerCase().includes(bookSearch.toLowerCase()),
      )
      setFilteredBooks(filtered)
    } else {
      setFilteredBooks(books)
    }
  }, [bookSearch, books])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate form data
      if (!formData.userId) throw new Error("Debes seleccionar un usuario")
      if (!formData.bookId) throw new Error("Debes seleccionar un libro")
      if (!formData.loanDate) throw new Error("La fecha de préstamo es obligatoria")
      if (!formData.dueDate) throw new Error("La fecha de vencimiento es obligatoria")

      // Check if due date is after loan date
      if (new Date(formData.dueDate) <= new Date(formData.loanDate)) {
        throw new Error("La fecha de vencimiento debe ser posterior a la fecha de préstamo")
      }

      const endpoint = loanId ? `/api/loans/${loanId}` : "/api/loans"
      const method = loanId ? "PUT" : "POST"

      // Log the data being sent
      console.log(`Sending ${method} request to ${endpoint} with data:`, {
        usuario_id: Number.parseInt(formData.userId),
        libro_id: Number.parseInt(formData.bookId),
        fecha_prestamo: formData.loanDate,
        fecha_vencimiento: formData.dueDate,
        notas: formData.notes,
      })

      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario_id: Number.parseInt(formData.userId),
          libro_id: Number.parseInt(formData.bookId),
          fecha_prestamo: formData.loanDate,
          fecha_vencimiento: formData.dueDate,
          notas: formData.notes,
        }),
      })

      // Log the response status
      console.log(`Response status: ${response.status}`)

      if (!response.ok) {
        const responseText = await response.text()
        console.error(`Error response: ${responseText}`)

        let errorMessage = "Error al procesar la solicitud"
        try {
          const errorData = JSON.parse(responseText)
          errorMessage = errorData.error || errorData.details || errorMessage
        } catch (e) {
          // If parsing fails, use the response text directly
          errorMessage = responseText || errorMessage
        }

        throw new Error(errorMessage)
      }

      const responseData = await response.json()
      console.log("Response data:", responseData)

      setSuccess(loanId ? "Préstamo actualizado correctamente" : "Préstamo registrado correctamente")

      // Redirect after a short delay
      setTimeout(() => {
        router.push("/admin/loans")
        router.refresh()
      }, 1500)
    } catch (err) {
      console.error("Error in handleSubmit:", err)
      setError(err instanceof Error ? err.message : "Error al procesar el préstamo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Link href="/admin/loans" className="text-sm text-muted-foreground hover:text-foreground">
          <Button variant="ghost" size="sm" className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Volver a préstamos
          </Button>
        </Link>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {isLoadingData ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg">Cargando datos...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="userSearch">Buscar Usuario</Label>
              <Input
                id="userSearch"
                placeholder="Buscar por nombre o email"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-md p-4">
              <Label className="block mb-2">Seleccionar Usuario</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className={`p-2 border rounded-md cursor-pointer hover:bg-muted ${
                        formData.userId === user.id.toString() ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, userId: user.id.toString() })}
                    >
                      <div className="font-medium">
                        {user.nombre} {user.apellido}
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No se encontraron usuarios</div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bookSearch">Buscar Libro</Label>
              <Input
                id="bookSearch"
                placeholder="Buscar por título o autor"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
              />
            </div>

            <div className="border rounded-md p-4">
              <Label className="block mb-2">Seleccionar Libro</Label>
              <div className="max-h-60 overflow-y-auto space-y-2">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                    <div
                      key={book.id}
                      className={`p-2 border rounded-md cursor-pointer hover:bg-muted ${
                        formData.bookId === book.id.toString() ? "bg-primary/10 border-primary" : ""
                      }`}
                      onClick={() => setFormData({ ...formData, bookId: book.id.toString() })}
                    >
                      <div className="font-medium">{book.titulo}</div>
                      <div className="text-sm text-muted-foreground">
                        {book.autor} • {book.copias_disponibles}{" "}
                        {book.copias_disponibles === 1 ? "copia disponible" : "copias disponibles"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No se encontraron libros disponibles</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="loanDate">Fecha de Préstamo</Label>
                <Input
                  id="loanDate"
                  type="date"
                  value={formData.loanDate}
                  onChange={(e) => setFormData({ ...formData, loanDate: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="dueDate">Fecha de Vencimiento</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="notes">Notas (opcional)</Label>
              <textarea
                id="notes"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Añade notas o comentarios sobre este préstamo"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loanId ? "Actualizar Préstamo" : "Registrar Préstamo"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}

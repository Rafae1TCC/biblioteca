// Prueba de funcionalidad de búsqueda y filtros

// Datos de ejemplo
const sampleBooks = [
  { id: 1, titulo: "1984", autor: "George Orwell", genero: "Ficción", año: 1949 },
  { id: 2, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", genero: "Realismo mágico", año: 1967 },
  { id: 3, titulo: "El principito", autor: "Antoine de Saint-Exupéry", genero: "Infantil", año: 1943 },
  { id: 4, titulo: "Don Quijote", autor: "Miguel de Cervantes", genero: "Clásico", año: 1605 },
  { id: 5, titulo: "Orgullo y prejuicio", autor: "Jane Austen", genero: "Romance", año: 1813 },
]

// Función de búsqueda por texto
function searchBooks(books, searchTerm) {
  if (!searchTerm) return books

  const term = searchTerm.toLowerCase()
  return books.filter((book) => book.titulo.toLowerCase().includes(term) || book.autor.toLowerCase().includes(term))
}

// Función de filtro por género
function filterByGenre(books, genre) {
  if (!genre) return books
  return books.filter((book) => book.genero === genre)
}

// Función de filtro por año
function filterByYear(books, startYear, endYear) {
  return books.filter((book) => book.año >= (startYear || 0) && book.año <= (endYear || new Date().getFullYear()))
}

// Función de ordenamiento
function sortBooks(books, sortBy, order = "asc") {
  const sorted = [...books].sort((a, b) => {
    let valueA = a[sortBy]
    let valueB = b[sortBy]

    if (typeof valueA === "string") {
      valueA = valueA.toLowerCase()
      valueB = valueB.toLowerCase()
    }

    if (order === "asc") {
      return valueA < valueB ? -1 : valueA > valueB ? 1 : 0
    } else {
      return valueA > valueB ? -1 : valueA < valueB ? 1 : 0
    }
  })

  return sorted
}

// Función de paginación
function paginateResults(books, page = 1, itemsPerPage = 10) {
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage

  return {
    books: books.slice(startIndex, endIndex),
    totalPages: Math.ceil(books.length / itemsPerPage),
    currentPage: page,
    totalItems: books.length,
  }
}

const { describe, test, expect } = require("@jest/globals")

describe("Búsqueda y Filtros", () => {
  describe("Búsqueda por texto", () => {
    test("Busca por título correctamente", () => {
      const results = searchBooks(sampleBooks, "1984")
      expect(results).toHaveLength(1)
      expect(results[0].titulo).toBe("1984")
    })

    test("Busca por autor correctamente", () => {
      const results = searchBooks(sampleBooks, "Orwell")
      expect(results).toHaveLength(1)
      expect(results[0].autor).toBe("George Orwell")
    })

    test("Búsqueda insensible a mayúsculas", () => {
      const results = searchBooks(sampleBooks, "ORWELL")
      expect(results).toHaveLength(1)
      expect(results[0].autor).toBe("George Orwell")
    })

    test("Retorna todos los libros cuando no hay término de búsqueda", () => {
      const results = searchBooks(sampleBooks, "")
      expect(results).toHaveLength(5)
    })
  })

  describe("Filtros por género", () => {
    test("Filtra por género correctamente", () => {
      const results = filterByGenre(sampleBooks, "Ficción")
      expect(results).toHaveLength(1)
      expect(results[0].genero).toBe("Ficción")
    })

    test("Retorna todos los libros cuando no hay filtro de género", () => {
      const results = filterByGenre(sampleBooks, null)
      expect(results).toHaveLength(5)
    })
  })

  describe("Filtros por año", () => {
    test("Filtra por rango de años correctamente", () => {
      const results = filterByYear(sampleBooks, 1900, 1950)
      expect(results).toHaveLength(2) // 1984 (1949) y El principito (1943)
    })

    test("Filtra desde un año específico", () => {
      const results = filterByYear(sampleBooks, 1950)
      expect(results).toHaveLength(1) // Solo Cien años de soledad (1967)
    })
  })

  describe("Ordenamiento", () => {
    test("Ordena por título ascendente", () => {
      const results = sortBooks(sampleBooks, "titulo", "asc")
      expect(results[0].titulo).toBe("1984")
      expect(results[1].titulo).toBe("Cien años de soledad")
    })

    test("Ordena por año descendente", () => {
      const results = sortBooks(sampleBooks, "año", "desc")
      expect(results[0].año).toBe(1967)
      expect(results[1].año).toBe(1949)
    })
  })

  describe("Paginación", () => {
    test("Pagina resultados correctamente", () => {
      const results = paginateResults(sampleBooks, 1, 2)
      expect(results.books).toHaveLength(2)
      expect(results.totalPages).toBe(3)
      expect(results.currentPage).toBe(1)
      expect(results.totalItems).toBe(5)
    })

    test("Segunda página contiene elementos correctos", () => {
      const results = paginateResults(sampleBooks, 2, 2)
      expect(results.books).toHaveLength(2)
      expect(results.currentPage).toBe(2)
    })
  })
})

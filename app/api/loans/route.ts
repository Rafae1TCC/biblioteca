import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request) {
  try {
    console.log("GET /api/loans - Starting request")

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de consulta
    const url = new URL(request.url)
    const status = url.searchParams.get("status")
    const userId = url.searchParams.get("userId")
    const bookId = url.searchParams.get("bookId")
    const limit = url.searchParams.get("limit")

    let query = `
      SELECT p.*, 
             l.titulo as libro_titulo, 
             l.autor as libro_autor,
             u.nombre as usuario_nombre, 
             u.apellido as usuario_apellido,
             u.email as usuario_email
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
    `

    const params: any[] = []
    const conditions: string[] = []

    // Si no es administrador, solo mostrar sus préstamos
    if (session.user.role !== "administrador") {
      conditions.push("p.usuario_id = $" + (params.length + 1))
      params.push(session.user.id)
    } else {
      // Filtros adicionales solo para administradores
      if (userId) {
        conditions.push("p.usuario_id = $" + (params.length + 1))
        params.push(userId)
      }

      if (bookId) {
        conditions.push("p.libro_id = $" + (params.length + 1))
        params.push(bookId)
      }
    }

    // Filtro por estado para todos los usuarios
    if (status) {
      conditions.push("p.estado = $" + (params.length + 1))
      params.push(status)
    }

    // Añadir condiciones a la consulta
    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ")
    }

    // Ordenar por estado y fecha
    query +=
      " ORDER BY CASE WHEN p.estado = 'vencido' THEN 0 WHEN p.estado = 'activo' THEN 1 ELSE 2 END, p.fecha_prestamo DESC"

    // Limitar resultados si se especifica
    if (limit) {
      query += " LIMIT $" + (params.length + 1)
      params.push(Number.parseInt(limit))
    }

    console.log("Executing query:", query)
    console.log("Params:", params)

    const loans = await executeQuery(query, params)
    console.log("Loans result:", loans.length, "loans found")

    return NextResponse.json(loans)
  } catch (error) {
    console.error("Error fetching loans:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al obtener préstamos",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("POST /api/loans - Starting request")

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const data = await request.json()
    console.log("Request data:", data)

    const { usuario_id, libro_id, fecha_prestamo, fecha_vencimiento, notas } = data

    // Validar datos
    if (!usuario_id || !libro_id || !fecha_prestamo || !fecha_vencimiento) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar que el usuario exista y esté activo
    const userQuery = "SELECT id FROM usuarios WHERE id = $1 AND estado = 'activo'"
    const userResult = await executeQuery(userQuery, [usuario_id])
    console.log("User query result:", userResult)

    if (userResult.length === 0) {
      return NextResponse.json({ error: "El usuario no existe o no está activo" }, { status: 400 })
    }

    // Verificar que el libro exista y tenga copias disponibles
    const bookQuery = "SELECT id, copias_disponibles FROM libros WHERE id = $1 AND activo = true"
    const bookResult = await executeQuery(bookQuery, [libro_id])
    console.log("Book query result:", bookResult)

    if (bookResult.length === 0) {
      return NextResponse.json({ error: "El libro no existe o no está activo" }, { status: 400 })
    }

    if (bookResult[0].copias_disponibles <= 0) {
      return NextResponse.json({ error: "No hay copias disponibles de este libro" }, { status: 400 })
    }

    // Iniciar una transacción
    console.log("Starting transaction")
    await executeQuery("BEGIN")

    try {
      // Crear el préstamo
      console.log("Inserting loan")
      const insertQuery = `
        INSERT INTO prestamos (usuario_id, libro_id, fecha_prestamo, fecha_vencimiento, estado, notas)
        VALUES ($1, $2, $3, $4, 'activo', $5)
        RETURNING id
      `
      const insertParams = [usuario_id, libro_id, fecha_prestamo, fecha_vencimiento, notas || null]
      console.log("Insert query:", insertQuery)
      console.log("Insert params:", insertParams)

      const loanResult = await executeQuery(insertQuery, insertParams)
      console.log("Loan insert result:", loanResult)

      // Actualizar las copias disponibles del libro
      console.log("Updating book copies")
      const updateQuery = "UPDATE libros SET copias_disponibles = copias_disponibles - 1 WHERE id = $1"
      console.log("Update query:", updateQuery)
      console.log("Update params:", [libro_id])

      await executeQuery(updateQuery, [libro_id])

      // Confirmar la transacción
      console.log("Committing transaction")
      await executeQuery("COMMIT")

      return NextResponse.json({
        id: loanResult[0].id,
        message: "Préstamo registrado correctamente",
      })
    } catch (transactionError) {
      // Revertir la transacción en caso de error
      console.error("Transaction error, rolling back:", transactionError)
      await executeQuery("ROLLBACK")
      throw transactionError
    }
  } catch (error) {
    console.error("Error creating loan:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al crear el préstamo",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

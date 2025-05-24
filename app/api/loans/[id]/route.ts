import { NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`GET /api/loans/${params.id} - Starting request`)

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Verificar si el usuario está autenticado
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const loanId = params.id

    // Obtener el préstamo con información del libro y usuario
    let query = `
      SELECT p.*, 
             l.titulo as libro_titulo, 
             l.autor as libro_autor,
             l.isbn as libro_isbn,
             u.nombre as usuario_nombre,
             u.apellido as usuario_apellido,
             u.email as usuario_email
      FROM prestamos p
      JOIN libros l ON p.libro_id = l.id
      JOIN usuarios u ON p.usuario_id = u.id
      WHERE p.id = $1
    `
    const queryParams = [loanId]
    console.log("Query:", query)
    console.log("Params:", queryParams)

    // Si no es administrador, solo puede ver sus propios préstamos
    if (session.user.role !== "administrador") {
      query += " AND p.usuario_id = $2"
      queryParams.push(session.user.id)
    }

    const loans = await executeQuery(query, queryParams)
    console.log("Query result:", loans)

    if (loans.length === 0) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(loans[0])
  } catch (error) {
    console.error("Error fetching loan:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al obtener el préstamo",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`PUT /api/loans/${params.id} - Starting request`)

    const session = await getServerSession(authOptions)
    console.log("Session:", session ? "Authenticated" : "Not authenticated")

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const loanId = params.id
    const data = await request.json()
    console.log("Request data:", data)

    const { fecha_prestamo, fecha_vencimiento, notas } = data

    // Validar datos
    if (!fecha_prestamo || !fecha_vencimiento) {
      return NextResponse.json({ error: "Faltan datos requeridos" }, { status: 400 })
    }

    // Verificar que el préstamo exista
    const loanQuery = "SELECT * FROM prestamos WHERE id = $1"
    const loanResult = await executeQuery(loanQuery, [loanId])
    console.log("Loan query result:", loanResult)

    if (loanResult.length === 0) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 })
    }

    // No permitir editar préstamos devueltos
    const loan = loanResult[0]
    if (loan.estado === "devuelto") {
      return NextResponse.json({ error: "No se puede editar un préstamo devuelto" }, { status: 400 })
    }

    // Actualizar el préstamo
    const updateQuery = `
      UPDATE prestamos 
      SET fecha_prestamo = $1, fecha_vencimiento = $2, notas = $3
      WHERE id = $4
    `
    const updateParams = [fecha_prestamo, fecha_vencimiento, notas || null, loanId]
    console.log("Update query:", updateQuery)
    console.log("Update params:", updateParams)

    await executeQuery(updateQuery, updateParams)

    return NextResponse.json({ message: "Préstamo actualizado correctamente" })
  } catch (error) {
    console.error("Error updating loan:", error)

    // Devolver un error más detallado
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      {
        error: "Error al actualizar el préstamo",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}

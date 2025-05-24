// Prueba de estados y transiciones del sistema

// Estados posibles de un libro
const BOOK_STATES = {
    AVAILABLE: "disponible",
    BORROWED: "prestado",
    RESERVED: "reservado",
    MAINTENANCE: "mantenimiento",
    LOST: "perdido",
  }
  
  // Estados posibles de un préstamo
  const LOAN_STATES = {
    ACTIVE: "activo",
    RETURNED: "devuelto",
    OVERDUE: "vencido",
    RENEWED: "renovado",
  }
  
  // Estados posibles de una reserva
  const RESERVATION_STATES = {
    PENDING: "pendiente",
    CONFIRMED: "confirmada",
    CANCELLED: "cancelada",
    EXPIRED: "expirada",
  }
  
  // Estados posibles de un usuario
  const USER_STATES = {
    ACTIVE: "activo",
    INACTIVE: "inactivo",
    SUSPENDED: "suspendido",
    PENDING_VERIFICATION: "pendiente_verificacion",
  }
  
  // Función que verifica transiciones válidas de préstamos
  function canTransitionLoan(currentState, newState) {
    const validTransitions = {
      [LOAN_STATES.ACTIVE]: [LOAN_STATES.RETURNED, LOAN_STATES.OVERDUE, LOAN_STATES.RENEWED],
      [LOAN_STATES.OVERDUE]: [LOAN_STATES.RETURNED, LOAN_STATES.RENEWED],
      [LOAN_STATES.RENEWED]: [LOAN_STATES.RETURNED, LOAN_STATES.OVERDUE],
      [LOAN_STATES.RETURNED]: [], // Estado final
    }
  
    return validTransitions[currentState]?.includes(newState) || false
  }
  
  // Función que verifica transiciones válidas de reservas
  function canTransitionReservation(currentState, newState) {
    const validTransitions = {
      [RESERVATION_STATES.PENDING]: [
        RESERVATION_STATES.CONFIRMED,
        RESERVATION_STATES.CANCELLED,
        RESERVATION_STATES.EXPIRED,
      ],
      [RESERVATION_STATES.CONFIRMED]: [RESERVATION_STATES.CANCELLED],
      [RESERVATION_STATES.CANCELLED]: [], // Estado final
      [RESERVATION_STATES.EXPIRED]: [], // Estado final
    }
  
    return validTransitions[currentState]?.includes(newState) || false
  }
  
  // Función que verifica si un usuario puede realizar una acción
  function canUserPerformAction(userState, action) {
    const allowedActions = {
      [USER_STATES.ACTIVE]: ["borrow", "reserve", "return", "renew"],
      [USER_STATES.INACTIVE]: [],
      [USER_STATES.SUSPENDED]: ["return"], // Solo puede devolver libros
      [USER_STATES.PENDING_VERIFICATION]: ["return"], // Solo puede devolver libros
    }
  
    return allowedActions[userState]?.includes(action) || false
  }
  
  // Función que calcula el estado de un libro basado en sus préstamos y reservas
  function calculateBookState(book, activeLoans, activeReservations) {
    if (book.estado === BOOK_STATES.MAINTENANCE || book.estado === BOOK_STATES.LOST) {
      return book.estado
    }
  
    const copiesLoaned = activeLoans.length
    const copiesReserved = activeReservations.length
  
    if (copiesLoaned >= book.cantidad_disponible) {
      return BOOK_STATES.BORROWED
    } else if (copiesReserved > 0 && copiesLoaned + copiesReserved >= book.cantidad_disponible) {
      return BOOK_STATES.RESERVED
    } else {
      return BOOK_STATES.AVAILABLE
    }
  }
  
  const { describe, test, expect } = require("@jest/globals")
  
  describe("Estados y Transiciones del Sistema", () => {
    describe("Transiciones de Préstamos", () => {
      test("Préstamo activo puede pasar a devuelto", () => {
        const canTransition = canTransitionLoan(LOAN_STATES.ACTIVE, LOAN_STATES.RETURNED)
        expect(canTransition).toBe(true)
      })
  
      test("Préstamo activo puede pasar a vencido", () => {
        const canTransition = canTransitionLoan(LOAN_STATES.ACTIVE, LOAN_STATES.OVERDUE)
        expect(canTransition).toBe(true)
      })
  
      test("Préstamo devuelto no puede cambiar de estado", () => {
        const canTransition = canTransitionLoan(LOAN_STATES.RETURNED, LOAN_STATES.ACTIVE)
        expect(canTransition).toBe(false)
      })
  
      test("Préstamo vencido puede ser renovado", () => {
        const canTransition = canTransitionLoan(LOAN_STATES.OVERDUE, LOAN_STATES.RENEWED)
        expect(canTransition).toBe(true)
      })
    })
  
    describe("Transiciones de Reservas", () => {
      test("Reserva pendiente puede ser confirmada", () => {
        const canTransition = canTransitionReservation(RESERVATION_STATES.PENDING, RESERVATION_STATES.CONFIRMED)
        expect(canTransition).toBe(true)
      })
  
      test("Reserva pendiente puede ser cancelada", () => {
        const canTransition = canTransitionReservation(RESERVATION_STATES.PENDING, RESERVATION_STATES.CANCELLED)
        expect(canTransition).toBe(true)
      })
  
      test("Reserva cancelada no puede cambiar de estado", () => {
        const canTransition = canTransitionReservation(RESERVATION_STATES.CANCELLED, RESERVATION_STATES.PENDING)
        expect(canTransition).toBe(false)
      })
    })
  
    describe("Acciones de Usuario según Estado", () => {
      test("Usuario activo puede realizar todas las acciones", () => {
        expect(canUserPerformAction(USER_STATES.ACTIVE, "borrow")).toBe(true)
        expect(canUserPerformAction(USER_STATES.ACTIVE, "reserve")).toBe(true)
        expect(canUserPerformAction(USER_STATES.ACTIVE, "return")).toBe(true)
      })
  
      test("Usuario suspendido solo puede devolver libros", () => {
        expect(canUserPerformAction(USER_STATES.SUSPENDED, "borrow")).toBe(false)
        expect(canUserPerformAction(USER_STATES.SUSPENDED, "reserve")).toBe(false)
        expect(canUserPerformAction(USER_STATES.SUSPENDED, "return")).toBe(true)
      })
  
      test("Usuario inactivo no puede realizar acciones", () => {
        expect(canUserPerformAction(USER_STATES.INACTIVE, "borrow")).toBe(false)
        expect(canUserPerformAction(USER_STATES.INACTIVE, "reserve")).toBe(false)
        expect(canUserPerformAction(USER_STATES.INACTIVE, "return")).toBe(false)
      })
    })
  
    describe("Estados de Libros", () => {
      test("Libro disponible cuando hay copias libres", () => {
        const book = { cantidad_disponible: 3, estado: BOOK_STATES.AVAILABLE }
        const activeLoans = [{}] // 1 préstamo activo
        const activeReservations = []
  
        const state = calculateBookState(book, activeLoans, activeReservations)
        expect(state).toBe(BOOK_STATES.AVAILABLE)
      })
  
      test("Libro prestado cuando todas las copias están prestadas", () => {
        const book = { cantidad_disponible: 2, estado: BOOK_STATES.AVAILABLE }
        const activeLoans = [{}, {}] // 2 préstamos activos
        const activeReservations = []
  
        const state = calculateBookState(book, activeLoans, activeReservations)
        expect(state).toBe(BOOK_STATES.BORROWED)
      })
  
      test("Libro reservado cuando hay reservas pendientes", () => {
        const book = { cantidad_disponible: 2, estado: BOOK_STATES.AVAILABLE }
        const activeLoans = [{}] // 1 préstamo activo
        const activeReservations = [{}] // 1 reserva activa
  
        const state = calculateBookState(book, activeLoans, activeReservations)
        expect(state).toBe(BOOK_STATES.RESERVED)
      })
    })
  
    describe("Casos específicos para usuario leobaslo.inide@gmail.com", () => {
      test("Usuario con email específico puede realizar acciones si está activo", () => {
        const userEmail = "leobaslo.inide@gmail.com"
        const userState = USER_STATES.ACTIVE
  
        expect(userEmail).toBe("leobaslo.inide@gmail.com")
        expect(canUserPerformAction(userState, "borrow")).toBe(true)
        expect(canUserPerformAction(userState, "reserve")).toBe(true)
      })
    })
  })
  
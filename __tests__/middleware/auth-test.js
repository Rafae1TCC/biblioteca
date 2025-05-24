import { NextResponse } from "next/server"
import { POST } from "../../app/api/mock-auth/login/route"
import { login } from "../../lib/mock-auth"
import jest from "jest"

// Mock de lib/mock-auth
jest.mock("../../lib/mock-auth", () => ({
  login: jest.fn(),
}))

// Mock de next/server
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, options })),
  },
}))

describe("API de login simulado", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("debe autenticar correctamente con las credenciales de Leo Baslo", async () => {
    // Configurar el mock de login para que devuelva un usuario
    const mockUser = {
      id: "3",
      name: "Leo Baslo",
      email: "leobaslo.inide@gmail.com",
      role: "usuario",
    }
    login.mockResolvedValue(mockUser)

    // Crear una solicitud con las credenciales correctas
    const request = {
      json: jest.fn().mockResolvedValue({
        email: "leobaslo.inide@gmail.com",
        password: "Tecate15",
      }),
    }

    // Ejecutar el endpoint
    const response = await POST(request)

    // Verificar que se llamó a login con las credenciales correctas
    expect(login).toHaveBeenCalledWith("leobaslo.inide@gmail.com", "Tecate15")

    // Verificar la respuesta
    expect(NextResponse.json).toHaveBeenCalledWith({
      success: true,
      user: mockUser,
    })
    expect(response.data.success).toBe(true)
    expect(response.data.user).toEqual(mockUser)
  })

  it("debe rechazar la autenticación con credenciales incorrectas", async () => {
    // Configurar el mock de login para que devuelva null (autenticación fallida)
    login.mockResolvedValue(null)

    // Crear una solicitud con credenciales incorrectas
    const request = {
      json: jest.fn().mockResolvedValue({
        email: "leobaslo.inide@gmail.com",
        password: "ContraseñaIncorrecta",
      }),
    }

    // Ejecutar el endpoint
    const response = await POST(request)

    // Verificar que se llamó a login con las credenciales incorrectas
    expect(login).toHaveBeenCalledWith("leobaslo.inide@gmail.com", "ContraseñaIncorrecta")

    // Verificar la respuesta de error
    expect(NextResponse.json).toHaveBeenCalledWith(
      { success: false, message: "Credenciales inválidas" },
      { status: 401 },
    )
    expect(response.data.success).toBe(false)
    expect(response.options.status).toBe(401)
  })

  it("debe manejar errores durante el proceso de login", async () => {
    // Configurar el mock de request.json para que lance un error
    const request = {
      json: jest.fn().mockRejectedValue(new Error("Error al procesar JSON")),
    }

    // Ejecutar el endpoint
    const response = await POST(request)

    // Verificar la respuesta de error del servidor
    expect(NextResponse.json).toHaveBeenCalledWith({ success: false, message: "Error en el servidor" }, { status: 500 })
    expect(response.data.success).toBe(false)
    expect(response.options.status).toBe(500)
  })
})

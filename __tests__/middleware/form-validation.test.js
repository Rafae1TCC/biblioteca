// Prueba de validación de formularios

// Función que simula la validación de registro
function validateRegistrationForm(data) {
    const errors = []
  
    // Validar email
    if (!data.email) {
      errors.push("Email es requerido")
    } else if (!data.email.includes("@")) {
      errors.push("Email debe tener formato válido")
    }
  
    // Validar contraseña
    if (!data.password) {
      errors.push("Contraseña es requerida")
    } else if (data.password.length < 6) {
      errors.push("Contraseña debe tener al menos 6 caracteres")
    }
  
    // Validar nombre
    if (!data.name) {
      errors.push("Nombre es requerido")
    } else if (data.name.length < 2) {
      errors.push("Nombre debe tener al menos 2 caracteres")
    }
  
    // Validar confirmación de contraseña
    if (data.password !== data.confirmPassword) {
      errors.push("Las contraseñas no coinciden")
    }
  
    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }
  
  // Función que simula la validación de libros
  function validateBookForm(data) {
    const errors = []
  
    if (!data.titulo) {
      errors.push("Título es requerido")
    } else if (data.titulo.length < 3) {
      errors.push("Título debe tener al menos 3 caracteres")
    }
  
    if (!data.autor) {
      errors.push("Autor es requerido")
    }
  
    if (!data.isbn) {
      errors.push("ISBN es requerido")
    } else if (data.isbn.length !== 13) {
      errors.push("ISBN debe tener 13 dígitos")
    }
  
    if (!data.genero_id) {
      errors.push("Género es requerido")
    }
  
    return {
      isValid: errors.length === 0,
      errors: errors,
    }
  }
  
  const { describe, test, expect } = require("@jest/globals")
  
  describe("Validación de Formularios", () => {
    describe("Formulario de Registro", () => {
      test("Datos válidos pasan la validación", () => {
        const validData = {
          name: "Leonardo Basilio",
          email: "leobaslo.inide@gmail.com",
          password: "Tecate15",
          confirmPassword: "Tecate15",
        }
  
        const result = validateRegistrationForm(validData)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
  
      test("Email inválido falla la validación", () => {
        const invalidData = {
          name: "Leonardo Basilio",
          email: "email-invalido",
          password: "Tecate15",
          confirmPassword: "Tecate15",
        }
  
        const result = validateRegistrationForm(invalidData)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Email debe tener formato válido")
      })
  
      test("Contraseña corta falla la validación", () => {
        const invalidData = {
          name: "Leonardo Basilio",
          email: "leobaslo.inide@gmail.com",
          password: "123",
          confirmPassword: "123",
        }
  
        const result = validateRegistrationForm(invalidData)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Contraseña debe tener al menos 6 caracteres")
      })
  
      test("Contraseñas no coinciden falla la validación", () => {
        const invalidData = {
          name: "Leonardo Basilio",
          email: "leobaslo.inide@gmail.com",
          password: "Tecate15",
          confirmPassword: "Tecate16",
        }
  
        const result = validateRegistrationForm(invalidData)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("Las contraseñas no coinciden")
      })
    })
  
    describe("Formulario de Libros", () => {
      test("Datos válidos de libro pasan la validación", () => {
        const validBook = {
          titulo: "1984",
          autor: "George Orwell",
          isbn: "9780451524935",
          genero_id: 1,
        }
  
        const result = validateBookForm(validBook)
        expect(result.isValid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
  
      test("ISBN inválido falla la validación", () => {
        const invalidBook = {
          titulo: "1984",
          autor: "George Orwell",
          isbn: "123",
          genero_id: 1,
        }
  
        const result = validateBookForm(invalidBook)
        expect(result.isValid).toBe(false)
        expect(result.errors).toContain("ISBN debe tener 13 dígitos")
      })
    })
  })
  
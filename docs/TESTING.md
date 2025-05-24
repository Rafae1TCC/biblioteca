# Guía de Pruebas Unitarias - BibliotecaHub

## Configuración del Entorno de Pruebas

### Instalación de Dependencias

\`\`\`bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom @types/jest
\`\`\`

### Estructura de Archivos de Pruebas

\`\`\`
__tests__/
├── api/
│   ├── reservas.test.js
│   └── wishlist.test.js
├── components/
│   ├── ReservarButton.test.js
│   └── WishlistButton.test.js
└── utils/
    └── helpers.test.js
\`\`\`

## Comandos de Pruebas

### Ejecutar todas las pruebas
\`\`\`bash
npm test
\`\`\`

### Ejecutar pruebas en modo watch (desarrollo)
\`\`\`bash
npm run test:watch
\`\`\`

### Ejecutar pruebas con reporte de cobertura
\`\`\`bash
npm run test:coverage
\`\`\`

### Ejecutar pruebas específicas
\`\`\`bash
# Pruebas de API de reservas
npm test -- __tests__/api/reservas.test.js

# Pruebas de componentes
npm test -- __tests__/components/

# Pruebas que contengan "reservar" en el nombre
npm test -- --testNamePattern="reservar"
\`\`\`

## Tipos de Pruebas Implementadas

### 1. Pruebas de API (Backend)

#### Reservas (`/api/reservas`)
- ✅ Crear reserva exitosamente
- ✅ Fallar sin autenticación
- ✅ Fallar sin ID de libro
- ✅ Fallar si libro no disponible
- ✅ Fallar si ya existe reserva activa
- ✅ Obtener reservas de usuario
- ✅ Obtener todas las reservas (admin)

#### Lista de Deseos (`/api/wishlist`)
- ✅ Añadir libro a lista de deseos
- ✅ Quitar libro de lista de deseos
- ✅ Fallar sin autenticación
- ✅ Fallar sin ID de libro
- ✅ Obtener lista de deseos

### 2. Pruebas de Componentes (Frontend)

#### ReservarButton
- ✅ Renderizado correcto
- ✅ Mostrar "Iniciar sesión" si no autenticado
- ✅ Hacer reserva exitosa
- ✅ Manejar errores de reserva
- ✅ Estado de carga

#### WishlistButton
- ✅ Renderizado correcto
- ✅ Añadir a lista de deseos
- ✅ Quitar de lista de deseos
- ✅ Manejar errores
- ✅ No funcionar sin autenticación

## Mocks Configurados

### NextAuth
\`\`\`javascript
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: { user: { email: 'test@example.com' } },
    status: 'authenticated',
  })),
}))
\`\`\`

### Next.js Router
\`\`\`javascript
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}))
\`\`\`

### Base de Datos
\`\`\`javascript
jest.mock('@/lib/db', () => ({
  executeQuery: jest.fn(),
}))
\`\`\`

## Cobertura de Código

### Objetivos de Cobertura
- **Líneas**: 70%
- **Funciones**: 70%
- **Ramas**: 70%
- **Declaraciones**: 70%

### Ver Reporte de Cobertura
\`\`\`bash
npm run test:coverage
\`\`\`

El reporte se genera en `coverage/lcov-report/index.html`

## Mejores Prácticas

### 1. Estructura de Pruebas
\`\`\`javascript
describe('Componente/Función', () => {
  beforeEach(() => {
    // Configuración antes de cada prueba
  })

  it('debería hacer algo específico', () => {
    // Prueba específica
  })
})
\`\`\`

### 2. Naming Conventions
- Archivos: `ComponentName.test.js`
- Describe: Nombre del componente/función
- It: "debería [acción esperada]"

### 3. Mocking
- Mock solo lo necesario
- Limpiar mocks después de cada prueba
- Usar mocks específicos para cada caso

### 4. Assertions
- Usar matchers específicos de jest-dom
- Verificar estados y comportamientos
- Probar casos de éxito y error

## Integración Continua

### GitHub Actions (ejemplo)
\`\`\`yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:ci
\`\`\`

## Próximos Pasos

1. **Pruebas de Integración**: Implementar con Playwright
2. **Pruebas E2E**: Flujos completos de usuario
3. **Performance Testing**: Pruebas de rendimiento
4. **Visual Regression**: Pruebas de regresión visual

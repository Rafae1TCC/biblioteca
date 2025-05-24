// Import testing library only
import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Set up environment variables for testing
process.env.NODE_ENV = "test"
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test"
process.env.NEXTAUTH_SECRET = "test-secret"
process.env.NEXTAUTH_URL = "http://localhost:3000"

// Mock Next.js server environment globals
global.Request = class Request {
  constructor(input, init) {
    this.url = input
    this.method = init?.method || "GET"
    this.headers = new Map(Object.entries(init?.headers || {}))
    this.body = init?.body
  }

  async json() {
    return JSON.parse(this.body || "{}")
  }
}

global.Response = class Response {
  constructor(body, init) {
    this.body = body
    this.status = init?.status || 200
    this.headers = new Map(Object.entries(init?.headers || {}))
  }

  async json() {
    return JSON.parse(this.body || "{}")
  }
}

global.URL = class URL {
  constructor(url) {
    this.href = url
    this.searchParams = new URLSearchParams(url.split("?")[1] || "")
  }
}

global.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this.params = new Map()
    if (typeof init === "string") {
      init.split("&").forEach((pair) => {
        const [key, value] = pair.split("=")
        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ""))
      })
    }
  }

  get(key) {
    return this.params.get(key)
  }

  set(key, value) {
    this.params.set(key, value)
  }
}

// Mock NextResponse (jest is available globally)
global.NextResponse = {
  json: jest.fn((data, init) => ({
    json: async () => data,
    status: init?.status || 200,
    headers: init?.headers || {},
  })),
  redirect: jest.fn((url) => ({
    type: "redirect",
    url: url.toString(),
  })),
  next: jest.fn(() => ({
    type: "next",
  })),
}

// Mock the database module
jest.mock("@/lib/db", () => ({
  executeQuery: jest.fn(),
  db: {
    query: jest.fn(),
    execute: jest.fn(),
  },
}))

// Mock NextAuth
jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}))

// Mock next-auth/jwt
jest.mock("next-auth/jwt", () => ({
  getToken: jest.fn(),
}))

// Mock auth config
jest.mock("@/lib/auth-config", () => ({
  authOptions: {},
}))

// Setup global console
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}

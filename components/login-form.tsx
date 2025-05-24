"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"

export function LoginForm({ callbackUrl = "/" }: { callbackUrl?: string }) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/mock-auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          router.push(callbackUrl)
          router.refresh()
        } else {
          setError(data.message || "Error al iniciar sesión")
        }
      } else {
        setError("Error al iniciar sesión. Por favor, inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("Error de inicio de sesión:", error)
      setError("Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div
          className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          aria-describedby="email-hint"
        />
        <p id="email-hint" className="text-xs text-muted-foreground">
          Usa admin@example.com para acceso de administrador o user@example.com para acceso de usuario regular
        </p>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <div className="text-center text-sm">
        ¿No tienes una cuenta?{" "}
        <a href="/registro" className="text-primary hover:underline underline-offset-4">
          Regístrate
        </a>
      </div>
    </form>
  )
}

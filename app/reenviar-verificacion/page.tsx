"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { AlertCircle, CheckCircle, MailIcon } from "lucide-react"

export default function ReenviarVerificacionPage() {
  const searchParams = useSearchParams()
  const initialEmail = searchParams.get("email") || ""
  const [email, setEmail] = useState(initialEmail)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al reenviar el correo de verificación")
      }

      setSuccess(true)
    } catch (error) {
      console.error("Error al reenviar verificación:", error)
      setError(error instanceof Error ? error.message : "Ocurrió un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Reenviar Verificación</CardTitle>
          <CardDescription className="text-center">BibliotecaHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <>
              <div className="flex justify-center">
                <MailIcon className="h-16 w-16 text-primary/80" />
              </div>
              <p className="text-center">Ingresa tu correo electrónico para recibir un nuevo enlace de verificación.</p>
              {error && (
                <div
                  className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded relative"
                  role="alert"
                >
                  <div className="flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nombre@ejemplo.com"
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Enviando..." : "Reenviar Verificación"}
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex justify-center">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-semibold">¡Correo Enviado!</h2>
                <p className="mt-2 text-muted-foreground">
                  Hemos enviado un nuevo correo de verificación a <strong>{email}</strong>. Por favor, revisa tu bandeja
                  de entrada y sigue las instrucciones para verificar tu cuenta.
                </p>
              </div>
            </>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild variant="outline">
            <Link href="/login">Volver a Iniciar Sesión</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, Loader2, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ToggleUserStatusFormProps {
  user: {
    id: number
    nombre: string
    apellido: string
    email: string
    rol: string
    estado: string
  }
}

export function ToggleUserStatusForm({ user }: ToggleUserStatusFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isActivating = user.estado === "inactivo"
  const actionText = isActivating ? "Activar" : "Desactivar"
  const statusText = isActivating ? "activado" : "desactivado"

  const handleToggleStatus = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${user.id}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          estado: isActivating ? "activo" : "inactivo",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `Error al ${actionText.toLowerCase()} el usuario`)
      }

      // Redirigir a la lista de usuarios
      router.push("/admin/users")
      router.refresh()
    } catch (err: any) {
      console.error("Error:", err)
      setError(err.message || "Ha ocurrido un error inesperado")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="text-sm text-muted-foreground">
          <Link href="/admin" className="hover:underline">
            Admin
          </Link>
          {" / "}
          <Link href="/admin/users" className="hover:underline">
            Usuarios
          </Link>
          {" / "}
          <span>{actionText} Usuario</span>
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{actionText} Usuario</CardTitle>
          <CardDescription>
            {isActivating
              ? "Activa este usuario para permitirle acceder al sistema"
              : "Desactiva este usuario para impedir su acceso al sistema"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-center py-4">
              {isActivating ? (
                <UserCheck className="h-16 w-16 text-green-500" />
              ) : (
                <UserX className="h-16 w-16 text-red-500" />
              )}
            </div>

            <Alert>
              <AlertDescription>
                ¿Estás seguro de que deseas {actionText.toLowerCase()} al usuario{" "}
                <strong>
                  {user.nombre} {user.apellido}
                </strong>{" "}
                ({user.email})?
                {!isActivating && user.rol === "administrador" && (
                  <p className="mt-2 text-red-500 font-semibold">
                    ¡Atención! Este usuario es un administrador. Al desactivarlo, perderá acceso al panel de
                    administración.
                  </p>
                )}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/users")}>
            Cancelar
          </Button>
          <Button
            type={isActivating ? "button" : "button"}
            variant={isActivating ? "default" : "destructive"}
            disabled={isLoading}
            onClick={handleToggleStatus}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {actionText} Usuario
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

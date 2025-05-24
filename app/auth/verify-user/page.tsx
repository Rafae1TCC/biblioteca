"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, UserPlus } from "lucide-react"

export default function VerifyUserPage() {
  const { data: session, status } = useSession()
  const [userVerification, setUserVerification] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [syncLoading, setSyncLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [syncResult, setSyncResult] = useState<any>(null)

  const verifyUser = async () => {
    if (status !== "authenticated") return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/auth/verify-user-db")
      const data = await response.json()
      setUserVerification(data)
    } catch (err) {
      setError("Error al verificar el usuario")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const forceSync = async () => {
    if (status !== "authenticated") return

    setSyncLoading(true)
    setSyncResult(null)

    try {
      const response = await fetch("/api/auth/force-user-sync", {
        method: "POST",
      })
      const data = await response.json()
      setSyncResult(data)

      // Volver a verificar el usuario después de la sincronización
      await verifyUser()
    } catch (err) {
      console.error(err)
      setSyncResult({ error: "Error al sincronizar el usuario" })
    } finally {
      setSyncLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      verifyUser()
    }
  }, [status])

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No autenticado</AlertTitle>
          <AlertDescription>Debes iniciar sesión para acceder a esta página.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Verificación de Usuario</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información de Sesión</CardTitle>
            <CardDescription>Datos de la sesión actual</CardDescription>
          </CardHeader>
          <CardContent>
            {session ? (
              <div className="space-y-2">
                <p>
                  <strong>Email:</strong> {session.user?.email}
                </p>
                <p>
                  <strong>Nombre:</strong> {session.user?.name}
                </p>
                <p>
                  <strong>ID:</strong> {session.user?.id}
                </p>
                <p>
                  <strong>Rol:</strong> {session.user?.role}
                </p>
              </div>
            ) : (
              <p>No hay datos de sesión disponibles</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Verificación en Base de Datos</CardTitle>
            <CardDescription>Comprueba si el usuario existe en la base de datos</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : userVerification ? (
              <div className="space-y-4">
                {userVerification.exists ? (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertTitle className="text-green-700">Usuario encontrado</AlertTitle>
                    <AlertDescription className="text-green-600">
                      El usuario existe en la base de datos
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>Usuario no encontrado</AlertTitle>
                    <AlertDescription>El usuario no existe en la base de datos</AlertDescription>
                  </Alert>
                )}

                {userVerification.exists && (
                  <div className="space-y-2 mt-4">
                    <h3 className="font-semibold">Datos en la base de datos:</h3>
                    <p>
                      <strong>ID:</strong> {userVerification.user.id}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {userVerification.user.nombre}
                    </p>
                    <p>
                      <strong>Apellido:</strong> {userVerification.user.apellido}
                    </p>
                    <p>
                      <strong>Email:</strong> {userVerification.user.email}
                    </p>
                    <p>
                      <strong>Rol:</strong> {userVerification.user.rol}
                    </p>
                    <p>
                      <strong>Estado:</strong> {userVerification.user.estado}
                    </p>
                    <p>
                      <strong>Google ID:</strong> {userVerification.user.google_id || "No disponible"}
                    </p>
                    <p>
                      <strong>Fecha de registro:</strong>{" "}
                      {new Date(userVerification.user.fecha_registro).toLocaleString()}
                    </p>
                  </div>
                )}

                {userVerification.session && (
                  <div className="space-y-2 mt-4">
                    <h3 className="font-semibold">Datos en la sesión:</h3>
                    <p>
                      <strong>Email:</strong> {userVerification.session.email}
                    </p>
                    <p>
                      <strong>Nombre:</strong> {userVerification.session.name}
                    </p>
                    <p>
                      <strong>ID:</strong> {userVerification.session.id}
                    </p>
                    <p>
                      <strong>Rol:</strong> {userVerification.session.role}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <p>No hay datos de verificación disponibles</p>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-2">
            <Button
              onClick={verifyUser}
              disabled={loading || status !== "authenticated"}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Verificar de nuevo
            </Button>

            <Button
              onClick={forceSync}
              disabled={syncLoading || status !== "authenticated"}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <UserPlus className="h-4 w-4" />
              {!userVerification?.exists ? "Crear usuario" : "Actualizar usuario"}
            </Button>
          </CardFooter>
        </Card>

        {syncResult && (
          <Card>
            <CardHeader>
              <CardTitle>Resultado de la sincronización</CardTitle>
            </CardHeader>
            <CardContent>
              {syncResult.error ? (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{syncResult.error}</AlertDescription>
                </Alert>
              ) : (
                <Alert className="bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <AlertTitle className="text-green-700">Sincronización exitosa</AlertTitle>
                  <AlertDescription className="text-green-600">
                    {syncResult.action === "created"
                      ? "Usuario creado correctamente"
                      : "Usuario actualizado correctamente"}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

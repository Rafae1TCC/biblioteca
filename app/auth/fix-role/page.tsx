"use client"

import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export default function FixRolePage() {
  const { data: session, status, update } = useSession()
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const fixRole = async () => {
    setIsFixing(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/auth/fix-admin-role")
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || "Error desconocido al intentar arreglar el rol")
      }
    } catch (err) {
      setError("Error de conexión al intentar arreglar el rol")
      console.error(err)
    } finally {
      setIsFixing(false)
    }
  }

  const handleSignOut = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  const isUabcEmail = session?.user?.email?.endsWith("@uabc.edu.mx") || false
  const isAdmin = session?.user?.role === "administrador"

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Solucionar Problema de Rol</h1>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Estado Actual</CardTitle>
              <CardDescription>Información sobre tu sesión actual</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === "loading" ? (
                <div className="flex items-center justify-center p-4">
                  <RefreshCw className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Cargando sesión...</span>
                </div>
              ) : status === "unauthenticated" ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No has iniciado sesión</AlertTitle>
                  <AlertDescription>Debes iniciar sesión para poder solucionar el problema de rol.</AlertDescription>
                </Alert>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="font-medium">Email:</div>
                    <div>{session?.user?.email}</div>

                    <div className="font-medium">Nombre:</div>
                    <div>{session?.user?.name}</div>

                    <div className="font-medium">Rol actual:</div>
                    <div className="flex items-center">
                      {isAdmin ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-600 font-medium">Administrador</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
                          <span>{session?.user?.role || "Usuario"}</span>
                        </>
                      )}
                    </div>

                    <div className="font-medium">Email de UABC:</div>
                    <div className="flex items-center">
                      {isUabcEmail ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-600">Sí</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                          <span className="text-red-600">No</span>
                        </>
                      )}
                    </div>
                  </div>

                  {isUabcEmail && !isAdmin && (
                    <Alert variant="warning" className="bg-amber-50 text-amber-800 border-amber-200">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Problema detectado</AlertTitle>
                      <AlertDescription>
                        Tienes un correo de UABC pero no tienes rol de administrador. Esto puede solucionarse con el
                        botón de abajo.
                      </AlertDescription>
                    </Alert>
                  )}

                  {isAdmin && (
                    <Alert className="bg-green-50 text-green-800 border-green-200">
                      <CheckCircle className="h-4 w-4" />
                      <AlertTitle>Todo correcto</AlertTitle>
                      <AlertDescription>
                        Ya tienes rol de administrador. No es necesario realizar ninguna acción.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              {session && isUabcEmail && !isAdmin && (
                <Button onClick={fixRole} disabled={isFixing} className="w-full">
                  {isFixing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Actualizando rol...
                    </>
                  ) : (
                    "Actualizar a rol de administrador"
                  )}
                </Button>
              )}

              {result && (
                <Alert className="bg-green-50 text-green-800 border-green-200 mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Rol actualizado</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {result && (
                <Button onClick={handleSignOut} className="mt-4">
                  Cerrar sesión para aplicar cambios
                </Button>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instrucciones</CardTitle>
              <CardDescription>Pasos para solucionar el problema de rol</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="list-decimal list-inside space-y-2">
                <li>
                  Verifica que estás usando un correo con dominio <strong>@uabc.edu.mx</strong>
                </li>
                <li>Haz clic en el botón "Actualizar a rol de administrador"</li>
                <li>Espera a que se complete la actualización</li>
                <li>Cierra sesión y vuelve a iniciar sesión para que los cambios surtan efecto</li>
                <li>Verifica que ahora tienes acceso a las funciones de administrador</li>
              </ol>

              <div className="text-sm text-muted-foreground mt-4">
                <p>Nota: Este proceso solo funciona para correos con dominio @uabc.edu.mx.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

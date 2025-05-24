"use client"

import { useSession } from "next-auth/react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { signIn, signOut } from "next-auth/react"
import { useState } from "react"

export default function AuthDebugPage() {
  const { data: session, status } = useSession()
  const [envVars, setEnvVars] = useState<Record<string, string> | null>(null)

  const checkEnvVars = async () => {
    try {
      const res = await fetch("/api/auth/check-env")
      const data = await res.json()
      setEnvVars(data)
    } catch (error) {
      console.error("Error checking env vars:", error)
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="contenido-principal" className="flex-1 container py-8">
        <h1 className="text-3xl font-bold mb-6">Diagnóstico de Autenticación</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Estado de la Sesión</CardTitle>
              <CardDescription>Información sobre el estado actual de tu sesión</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="font-medium">
                    Estado: <span className="font-normal">{status}</span>
                  </p>
                </div>

                {session ? (
                  <div className="space-y-2">
                    <p className="font-medium">Usuario autenticado:</p>
                    <pre className="bg-muted p-4 rounded-md overflow-auto">{JSON.stringify(session, null, 2)}</pre>
                  </div>
                ) : (
                  <p>No hay sesión activa</p>
                )}

                <div className="flex gap-4">
                  <Button onClick={() => signIn("google")}>Iniciar sesión</Button>
                  <Button variant="outline" onClick={() => signOut()}>
                    Cerrar sesión
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Variables de Entorno</CardTitle>
              <CardDescription>
                Verificar la configuración de variables de entorno (solo muestra si están definidas)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={checkEnvVars}>Verificar variables de entorno</Button>

                {envVars && (
                  <div className="space-y-2">
                    <p className="font-medium">Estado de las variables:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>NEXTAUTH_SECRET: {envVars.NEXTAUTH_SECRET ? "Definido ✅" : "No definido ❌"}</li>
                      <li>GOOGLE_CLIENT_ID: {envVars.GOOGLE_CLIENT_ID ? "Definido ✅" : "No definido ❌"}</li>
                      <li>GOOGLE_CLIENT_SECRET: {envVars.GOOGLE_CLIENT_SECRET ? "Definido ✅" : "No definido ❌"}</li>
                      <li>DATABASE_URL: {envVars.DATABASE_URL ? "Definido ✅" : "No definido ❌"}</li>
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}

import { redirect } from "next/navigation"
import { executeQuery } from "@/lib/db"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default async function VerificarEmailPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  if (!token) {
    redirect("/login")
  }

  let status: "success" | "expired" | "error" = "error"
  let message = "Ha ocurrido un error al verificar tu correo electrónico."
  let email = ""

  try {
    // Verificar si el token existe y no ha expirado
    const currentDate = new Date().toISOString()
    const user = await executeQuery(
      `SELECT id, email FROM usuarios 
       WHERE verification_token = $1 
       AND token_expiry > $2
       AND estado = 'pendiente'`,
      [token, currentDate],
    )

    if (user.length === 0) {
      // Verificar si el token existe pero ha expirado
      const expiredUser = await executeQuery(
        `SELECT id, email FROM usuarios 
         WHERE verification_token = $1 
         AND estado = 'pendiente'`,
        [token],
      )

      if (expiredUser.length > 0) {
        status = "expired"
        message = "El enlace de verificación ha expirado."
        email = expiredUser[0].email
      } else {
        status = "error"
        message = "El enlace de verificación no es válido."
      }
    } else {
      // Actualizar estado del usuario a activo
      await executeQuery(
        `UPDATE usuarios 
         SET estado = 'activo', 
             verification_token = NULL, 
             token_expiry = NULL,
             email_verified = true
         WHERE id = $1`,
        [user[0].id],
      )

      status = "success"
      message = "Tu correo electrónico ha sido verificado correctamente."
      email = user[0].email
    }
  } catch (error) {
    console.error("Error en la verificación de correo:", error)
    status = "error"
    message = "Ha ocurrido un error al verificar tu correo electrónico."
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Verificación de Correo</CardTitle>
          <CardDescription className="text-center">BibliotecaHub</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {status === "success" ? (
              <CheckCircle className="h-16 w-16 text-green-500" />
            ) : status === "expired" ? (
              <AlertCircle className="h-16 w-16 text-amber-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {status === "success"
                ? "¡Verificación Exitosa!"
                : status === "expired"
                  ? "Enlace Expirado"
                  : "Error de Verificación"}
            </h2>
            <p className="mt-2 text-muted-foreground">{message}</p>
            {email && <p className="mt-1 font-medium">{email}</p>}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          {status === "success" ? (
            <Button asChild className="w-full">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
          ) : status === "expired" ? (
            <Button asChild className="w-full">
              <Link href={`/reenviar-verificacion?email=${encodeURIComponent(email)}`}>
                Reenviar Correo de Verificación
              </Link>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link href="/registro">Volver al Registro</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

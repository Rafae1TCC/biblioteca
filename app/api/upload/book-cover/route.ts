import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-config"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "administrador") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener el archivo del FormData
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No se proporcionó ningún archivo" }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "El archivo debe ser una imagen" }, { status: 400 })
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "La imagen no debe superar los 5MB" }, { status: 400 })
    }

    // Generar un nombre único para el archivo
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 10)
    const fileName = `${timestamp}-${randomString}-${file.name.replace(/\s+/g, "-").toLowerCase()}`

    console.log(`Subiendo archivo: ${fileName}`)

    try {
      // Subir el archivo a Vercel Blob
      const blob = await put(fileName, file, {
        access: "public",
        addRandomSuffix: false, // Ya estamos generando un nombre único
      })

      console.log("Archivo subido exitosamente:", blob.url)

      // Devolver la URL del archivo subido
      return NextResponse.json({
        success: true,
        url: blob.url,
        fileName: fileName,
      })
    } catch (blobError: any) {
      console.error("Error al subir a Vercel Blob:", blobError)
      return NextResponse.json(
        {
          error: `Error al subir a Vercel Blob: ${blobError.message}`,
          details: blobError,
        },
        { status: 500 },
      )
    }
  } catch (error: any) {
    console.error("Error al procesar la solicitud:", error)
    return NextResponse.json(
      {
        error: `Error al procesar la solicitud: ${error.message}`,
        details: error,
      },
      { status: 500 },
    )
  }
}

import { put } from "@vercel/blob"
import { nanoid } from "nanoid"

export async function uploadBookCover(file: File) {
  try {
    console.log("Iniciando carga de portada...")

    // Verificar que tenemos el token
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error("BLOB_READ_WRITE_TOKEN no está configurado")
      throw new Error("Error de configuración: Token de Blob no disponible")
    }

    const filename = `portadas/${nanoid()}-${file.name}`
    console.log(`Subiendo archivo: ${filename}`)

    const { url } = await put(filename, file, {
      access: "public",
      token: process.env.BLOB_READ_WRITE_TOKEN,
    })

    console.log(`Archivo subido exitosamente: ${url}`)
    return url
  } catch (error) {
    console.error("Error detallado al subir la imagen:", error)
    throw new Error("No se pudo subir la portada del libro. Verifica la configuración de Vercel Blob.")
  }
}

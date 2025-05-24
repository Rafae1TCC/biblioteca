"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

interface WishlistButtonProps {
  libroId: number
  className?: string
}

export function WishlistButton({ libroId, className = "" }: WishlistButtonProps) {
  const [isInWishlist, setIsInWishlist] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkWishlist = async () => {
      try {
        setIsChecking(true)
        const response = await fetch(`/api/lista-deseos/verificar?libroId=${libroId}`)
        const data = await response.json()
        setIsInWishlist(data.isInWishlist)
      } catch (error) {
        console.error("Error al verificar lista de deseos:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkWishlist()
  }, [libroId])

  const handleToggleWishlist = async () => {
    setIsLoading(true)

    try {
      // Utilizamos el mismo endpoint para añadir y eliminar
      const response = await fetch("/api/lista-deseos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          libroId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar la lista de deseos")
      }

      // Actualizamos el estado basado en la acción realizada
      setIsInWishlist(data.action === "added")

      toast({
        title: data.action === "added" ? "Añadido a la lista de deseos" : "Eliminado de la lista de deseos",
        description: data.message,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar la lista de deseos. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <Button variant="outline" className={className} disabled>
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Cargando...
      </Button>
    )
  }

  return (
    <Button
      onClick={handleToggleWishlist}
      variant={isInWishlist ? "default" : "outline"}
      className={className}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Procesando...
        </>
      ) : (
        <>
          <Heart className="mr-2 h-4 w-4" fill={isInWishlist ? "currentColor" : "none"} />
          {isInWishlist ? "En Lista de Deseos" : "Añadir a Lista de Deseos"}
        </>
      )}
    </Button>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import type { User } from "@/lib/mock-auth"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function ReserveButton({ book, session }: { book: any; session: { user: User } | null }) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleReserve = async () => {
    if (!session) {
      router.push(`/login?callbackUrl=/catalog/${book.id}`)
      return
    }

    if (book.copias_disponibles <= 0) {
      toast({
        title: "Not available",
        description: "This book is currently not available for reservation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookId: book.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Error making reservation")
      }

      toast({
        title: "Reservation successful",
        description: "You have successfully reserved this book.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not complete the reservation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button disabled={book.copias_disponibles <= 0 || isLoading} onClick={handleReserve}>
      {isLoading ? "Processing..." : book.copias_disponibles > 0 ? "Reserve Book" : "Currently Unavailable"}
    </Button>
  )
}

"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "@/lib/mock-auth"

// Define the session type
export type Session = {
  user: User
} | null

// Create a context for the session
const SessionContext = createContext<{
  session: Session
  loading: boolean
  update: () => Promise<void>
}>({
  session: null,
  loading: true,
  update: async () => {},
})

// Custom hook to use the session
export function useSession() {
  return useContext(SessionContext)
}

// SessionProvider component
export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch the session
  const fetchSession = async () => {
    try {
      const response = await fetch("/api/mock-auth/session")
      if (response.ok) {
        const data = await response.json()
        setSession(data.session)
      } else {
        setSession(null)
      }
    } catch (error) {
      console.error("Error fetching session:", error)
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch session on mount
  useEffect(() => {
    fetchSession()
  }, [])

  // Update function to refresh the session
  const update = async () => {
    setLoading(true)
    await fetchSession()
  }

  return <SessionContext.Provider value={{ session, loading, update }}>{children}</SessionContext.Provider>
}

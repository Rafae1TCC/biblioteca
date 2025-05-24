"use client"

import Link from "next/link"
import { useSession } from "@/lib/session-context"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function NavBar() {
  const { session } = useSession()
  const router = useRouter()

  const handleSignIn = () => {
    router.push("/login")
  }

  const handleSignOut = async () => {
    try {
      await fetch("/api/mock-auth/logout", {
        method: "POST",
      })
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Library System</span>
          </Link>
        </div>
        <div className="flex items-center">
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/catalogo"
              className="text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-white"
            >
              Catálogo
            </Link>
            {session?.user.role === "administrador" && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-white"
              >
                Admin
              </Link>
            )}
            {session ? (
              <>
                <Link
                  href="/usuario/dashboard"
                  className="text-gray-700 hover:text-blue-700 dark:text-gray-300 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Button variant="outline" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={handleSignIn}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

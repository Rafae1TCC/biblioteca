// This file provides compatibility exports for components that still reference NextAuth
// while we're using the mock authentication system

import { getSession } from "./mock-auth"

// Dummy authOptions to satisfy imports
export const authOptions = {
  providers: [],
  callbacks: {},
  secret: process.env.NEXTAUTH_SECRET || "mock-secret",
}

// Helper function to provide NextAuth-like session for components that expect it
export async function getServerSession() {
  const session = await getSession()
  return session
}

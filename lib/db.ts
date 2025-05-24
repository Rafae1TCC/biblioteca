import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"

// Create a database connection
const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql)

// Function to execute SQL queries directly using tagged template literals
export async function executeQuery(query: string, params: any[] = []) {
  try {
    // Convert to tagged template literal format
    return await sql.query(query, params)
  } catch (error) {
    console.error("Error executing SQL query:", error)
    throw error
  }
}

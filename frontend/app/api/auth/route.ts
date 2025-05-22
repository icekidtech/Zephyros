import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    
    // This is a placeholder for actual authentication logic
    // In a real application, you would validate credentials against a database
    if (email === "demo@example.com" && password === "password") {
      return NextResponse.json({ 
        success: true, 
        user: { 
          id: "user-1", 
          email, 
          name: "Demo User" 
        },
        token: "sample-jwt-token"
      })
    }
    
    return NextResponse.json(
      { success: false, message: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      { success: false, message: "Authentication failed" },
      { status: 500 }
    )
  }
}
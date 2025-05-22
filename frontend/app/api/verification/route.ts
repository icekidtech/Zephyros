import { NextRequest, NextResponse } from "next/server"

// Mock verification data
const verifications = [
  {
    id: "ver-1",
    productId: "prod-1",
    timestamp: "2023-10-15T14:30:00Z",
    status: "verified",
    blockchainTxId: "0xabcdef1234567890abcdef1234567890",
    verifier: "0x1234567890abcdef1234567890abcdef"
  }
]

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  const productId = searchParams.get("productId")
  
  if (id) {
    const verification = verifications.find(v => v.id === id)
    if (!verification) {
      return NextResponse.json(
        { success: false, message: "Verification not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, verification })
  }
  
  if (productId) {
    const filtered = verifications.filter(v => v.productId === productId)
    return NextResponse.json({ success: true, verifications: filtered })
  }
  
  return NextResponse.json({ success: true, verifications })
}

export async function POST(request: NextRequest) {
  try {
    const { productId, verifier } = await request.json()
    
    if (!productId || !verifier) {
      return NextResponse.json(
        { success: false, message: "Product ID and verifier address are required" },
        { status: 400 }
      )
    }
    
    // In a real application, this would interact with a blockchain
    // This is just a mock implementation
    const newVerification = {
      id: `ver-${verifications.length + 1}`,
      productId,
      timestamp: new Date().toISOString(),
      status: "verified",
      blockchainTxId: `0x${Math.random().toString(16).slice(2, 40)}`,
      verifier
    }
    
    // verifications.push(newVerification) - would happen in a real implementation
    
    return NextResponse.json(
      { success: true, verification: newVerification },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating verification:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create verification" },
      { status: 500 }
    )
  }
}
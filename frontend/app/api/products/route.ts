import { NextRequest, NextResponse } from "next/server"

// Mock product data
const products = [
  {
    id: "prod-1",
    name: "Organic Coffee Beans",
    description: "Ethically sourced coffee beans from Colombia",
    price: 12.99,
    origin: "Colombia",
    certifications: ["Organic", "Fair Trade"],
    blockchainId: "0x123abc456def789"
  },
  {
    id: "prod-2",
    name: "Premium Chocolate",
    description: "Single-origin dark chocolate",
    price: 8.99,
    origin: "Ghana",
    certifications: ["Rainforest Alliance"],
    blockchainId: "0x789def456abc123"
  }
]

export async function GET(request: NextRequest) {
  // Get search params
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")
  
  if (id) {
    const product = products.find(p => p.id === id)
    if (!product) {
      return NextResponse.json(
        { success: false, message: "Product not found" },
        { status: 404 }
      )
    }
    return NextResponse.json({ success: true, product })
  }
  
  return NextResponse.json({ success: true, products })
}

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json()
    
    // In a real application, you would save to a database
    // This is just a mock implementation
    const newProduct = {
      id: `prod-${products.length + 1}`,
      ...productData,
      blockchainId: `0x${Math.random().toString(16).slice(2, 14)}`
    }
    
    // products.push(newProduct) - would happen in a real implementation
    
    return NextResponse.json(
      { success: true, product: newProduct },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create product" },
      { status: 500 }
    )
  }
}
"use client"

import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { ProductRegistrationForm } from "@/components/product/product-registration-form"
import { useContract } from "@/hooks/use-contract"
import { BarChart3, Package, Truck, Users, Settings, Home, LogOut } from "lucide-react"
import Link from "next/link"

export default function NewProductPage() {
  // Mock user data
  const user = {
    name: "John Doe",
    email: "john.doe@example.com",
  }

  // Mock sidebar navigation
  const sidebarSections = [
    {
      items: [
        { href: "/dashboard", icon: <Home />, label: "Dashboard" },
        { href: "/dashboard/products", icon: <Package />, label: "Products", badge: "24" },
        { href: "/dashboard/supply-chain", icon: <Truck />, label: "Supply Chain" },
        { href: "/dashboard/partners", icon: <Users />, label: "Partners" },
        { href: "/dashboard/analytics", icon: <BarChart3 />, label: "Analytics" },
      ],
    },
    {
      title: "Settings",
      items: [
        { href: "/dashboard/settings", icon: <Settings />, label: "Account Settings" },
        { href: "/logout", icon: <LogOut />, label: "Sign Out" },
      ],
    },
  ]

  // Example ABI for demonstration purposes
  const exampleABI = [
    {
      inputs: [
        { internalType: "string", name: "name", type: "string" },
        { internalType: "string", name: "description", type: "string" },
        { internalType: "string", name: "category", type: "string" },
        { internalType: "string", name: "sku", type: "string" },
        { internalType: "string", name: "manufacturer", type: "string" },
        { internalType: "string", name: "manufacturingDate", type: "string" },
        { internalType: "string", name: "batchNumber", type: "string" },
      ],
      name: "registerProduct",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
  ]

  // Replace with your actual contract address
  const contractAddress = "0x0000000000000000000000000000000000000000"

  const { contract } = useContract(contractAddress, exampleABI)

  return (
    <AppShell header={<Header user={user} />} sidebar={<Sidebar sections={sidebarSections} />} footer={<Footer />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Register New Product</h1>
            <p className="text-muted-foreground">Add a new product to the blockchain for supply chain tracking</p>
          </div>
          <Link href="/dashboard/products" className="text-sm font-medium text-[#1E88E5] hover:underline">
            Back to Products
          </Link>
        </div>

        <ProductRegistrationForm contract={contract} />
      </div>
    </AppShell>
  )
}

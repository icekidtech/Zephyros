"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { SupplyChainTimeline } from "@/components/ui/supply-chain-timeline"
import { VerificationForm } from "@/components/product/verification-form"
import { FilterBar } from "@/components/ui/filter-bar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, Package, Truck, Users, Settings, Home, LogOut } from "lucide-react"

export default function SupplyChainPage() {
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  const handleSearch = (value: string) => {
    console.log("Search:", value)
  }

  const handleFilterChange = (filterId: string, value: string) => {
    setActiveFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }))
  }

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

  // Mock supply chain data
  const pendingVerifications = [
    {
      productId: "PRD-001",
      productName: "Premium Coffee Beans",
      verificationStep: "Distribution Center",
    },
    {
      productId: "PRD-002",
      productName: "Organic Honey",
      verificationStep: "Quality Control",
    },
  ]

  // Mock supply chain steps
  const supplyChainSteps = [
    {
      title: "Manufacturing",
      description: "Product manufactured at Zephyros Coffee Co. facility",
      timestamp: "May 15, 2023",
      status: "verified",
      verifier: "0x1234567890abcdef1234567890abcdef12345678",
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    },
    {
      title: "Quality Control",
      description: "Product passed quality control inspection",
      timestamp: "May 16, 2023",
      status: "verified",
      verifier: "0x1234567890abcdef1234567890abcdef12345678",
      transactionHash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    },
    {
      title: "Distribution Center",
      description: "Product arrived at distribution center",
      timestamp: "May 20, 2023",
      status: "pending",
      verifier: "",
      transactionHash: "",
    },
    {
      title: "Retailer",
      description: "Product received by retailer",
      timestamp: "",
      status: "unknown",
      verifier: "",
      transactionHash: "",
    },
    {
      title: "Final Verification",
      description: "Product verified at point of sale",
      timestamp: "",
      status: "unknown",
      verifier: "",
      transactionHash: "",
    },
  ]

  // Filter options
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "pending", label: "Pending" },
        { value: "completed", label: "Completed" },
      ],
    },
    {
      id: "step",
      label: "Step",
      options: [
        { value: "manufacturing", label: "Manufacturing" },
        { value: "quality", label: "Quality Control" },
        { value: "distribution", label: "Distribution" },
        { value: "retail", label: "Retail" },
      ],
    },
  ]

  return (
    <AppShell header={<Header user={user} />} sidebar={<Sidebar sections={sidebarSections} />} footer={<Footer />}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Supply Chain Management</h1>
          <p className="text-muted-foreground">Track and verify products throughout the supply chain</p>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pending Verifications</TabsTrigger>
            <TabsTrigger value="tracking">Supply Chain Tracking</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <FilterBar
              placeholder="Search by product ID or name..."
              onSearch={handleSearch}
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
            />
          </div>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {pendingVerifications.map((verification) => (
                <VerificationForm
                  key={verification.productId}
                  productId={verification.productId}
                  productName={verification.productName}
                  verificationStep={verification.verificationStep}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tracking" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Supply Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <SupplyChainTimeline steps={supplyChainSteps} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

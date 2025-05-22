"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { ProductCard } from "@/components/product/product-card"
import { FilterBar } from "@/components/ui/filter-bar"
import { CustomButton } from "@/components/ui/custom-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus, BarChart3, Package, Truck, Users, Settings, Home, LogOut } from "lucide-react"

export default function ProductsPage() {
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

  // Mock product data
  const products = [
    {
      id: "PRD-001",
      name: "Premium Coffee Beans",
      description: "Single-origin arabica coffee beans from Ethiopia",
      status: "verified" as const,
      lastUpdated: "2 hours ago",
    },
    {
      id: "PRD-002",
      name: "Organic Honey",
      description: "Raw, unfiltered honey from sustainable apiaries",
      status: "pending" as const,
      lastUpdated: "1 day ago",
    },
    {
      id: "PRD-003",
      name: "Extra Virgin Olive Oil",
      description: "Cold-pressed olive oil from Mediterranean olives",
      status: "verified" as const,
      lastUpdated: "3 days ago",
    },
    {
      id: "PRD-004",
      name: "Artisanal Chocolate",
      description: "Single-origin dark chocolate from Peru",
      status: "rejected" as const,
      lastUpdated: "1 week ago",
    },
    {
      id: "PRD-005",
      name: "Organic Green Tea",
      description: "Premium green tea leaves from Japanese highlands",
      status: "verified" as const,
      lastUpdated: "2 days ago",
    },
    {
      id: "PRD-006",
      name: "Handcrafted Soap",
      description: "Natural soap made with essential oils and herbs",
      status: "pending" as const,
      lastUpdated: "5 days ago",
    },
    {
      id: "PRD-007",
      name: "Aged Balsamic Vinegar",
      description: "Traditional balsamic vinegar aged for 12 years",
      status: "verified" as const,
      lastUpdated: "1 month ago",
    },
    {
      id: "PRD-008",
      name: "Organic Quinoa",
      description: "Sustainably grown quinoa from Andean highlands",
      status: "verified" as const,
      lastUpdated: "2 weeks ago",
    },
  ]

  // Filter options
  const filterOptions = [
    {
      id: "status",
      label: "Status",
      options: [
        { value: "verified", label: "Verified" },
        { value: "pending", label: "Pending" },
        { value: "rejected", label: "Rejected" },
      ],
    },
    {
      id: "category",
      label: "Category",
      options: [
        { value: "food", label: "Food & Beverage" },
        { value: "electronics", label: "Electronics" },
        { value: "apparel", label: "Apparel" },
        { value: "cosmetics", label: "Cosmetics" },
      ],
    },
  ]

  return (
    <AppShell header={<Header user={user} />} sidebar={<Sidebar sections={sidebarSections} />} footer={<Footer />}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
          <CustomButton variant="brand" leftIcon={<Plus className="h-4 w-4" />} asChild>
            <Link href="/dashboard/products/new">Register Product</Link>
          </CustomButton>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Products</TabsTrigger>
            <TabsTrigger value="verified">Verified</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <FilterBar
              placeholder="Search products..."
              onSearch={handleSearch}
              filters={filterOptions}
              onFilterChange={handleFilterChange}
              activeFilters={activeFilters}
            />
          </div>

          <TabsContent value="all" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="verified" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products
                .filter((product) => product.status === "verified")
                .map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products
                .filter((product) => product.status === "pending")
                .map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="mt-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products
                .filter((product) => product.status === "rejected")
                .map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

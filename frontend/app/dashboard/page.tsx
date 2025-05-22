"use client"

import { useState } from "react"
import { AppShell } from "@/components/layout/app-shell"
import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Footer } from "@/components/layout/footer"
import { DashboardMetrics } from "@/components/ui/dashboard-metrics"
import { RecentActivity } from "@/components/ui/recent-activity"
import { ProductCard } from "@/components/product/product-card"
import { FilterBar } from "@/components/ui/filter-bar"
import { CustomButton } from "@/components/ui/custom-button"
import Link from "next/link"
import { Plus, BarChart3, Package, Truck, Users, Settings, Home, LogOut } from "lucide-react"

export default function DashboardPage() {
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <CustomButton variant="brand" leftIcon={<Plus className="h-4 w-4" />} asChild>
            <Link href="/dashboard/products/new">Register Product</Link>
          </CustomButton>
        </div>

        <DashboardMetrics />

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Recent Products</h2>
                <Link href="/dashboard/products" className="text-sm font-medium text-[#1E88E5] hover:underline">
                  View All
                </Link>
              </div>

              <FilterBar
                placeholder="Search products..."
                onSearch={handleSearch}
                filters={filterOptions}
                onFilterChange={handleFilterChange}
                activeFilters={activeFilters}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                {products.map((product) => (
                  <ProductCard key={product.id} {...product} />
                ))}
              </div>
            </div>
          </div>

          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </AppShell>
  )
}

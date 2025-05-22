"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Package, Truck, CheckCircle } from "lucide-react"

export interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  description?: string
  className?: string
}

export function MetricCard({ title, value, change, icon, description, className }: MetricCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-1 text-2xl font-bold">{value}</h3>
          </div>
          {icon && <div className="rounded-full bg-[#1E88E5]/10 p-2 text-[#1E88E5]">{icon}</div>}
        </div>

        {(change !== undefined || description) && (
          <div className="mt-4">
            {change !== undefined && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                  change > 0
                    ? "bg-[#43A047]/10 text-[#43A047]"
                    : change < 0
                      ? "bg-[#E53935]/10 text-[#E53935]"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {change > 0 ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : change < 0 ? (
                  <ArrowDownRight className="h-3 w-3" />
                ) : null}
                <span>{Math.abs(change)}%</span>
              </div>
            )}

            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export interface DashboardMetricsProps {
  metrics?: MetricCardProps[]
  className?: string
  isLoading?: boolean
}

export function DashboardMetrics({ metrics, className, isLoading = false }: DashboardMetricsProps) {
  // Default metrics if none provided
  const defaultMetrics: MetricCardProps[] = [
    {
      title: "Total Products",
      value: "1,284",
      change: 12.5,
      icon: <Package className="h-5 w-5" />,
      description: "Total products registered in the system",
    },
    {
      title: "Active Shipments",
      value: "37",
      change: -3.2,
      icon: <Truck className="h-5 w-5" />,
      description: "Products currently in transit",
    },
    {
      title: "Verification Rate",
      value: "98.7%",
      change: 2.1,
      icon: <CheckCircle className="h-5 w-5" />,
      description: "Products successfully verified",
    },
    {
      title: "Supply Chain Health",
      value: "Good",
      icon: <TrendingUp className="h-5 w-5" />,
      description: "Overall system performance",
    },
  ]

  const displayMetrics = metrics || defaultMetrics

  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {isLoading
        ? Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex animate-pulse flex-col space-y-3">
                  <div className="h-4 w-1/2 rounded bg-gray-200" />
                  <div className="h-8 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/4 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))
        : displayMetrics.map((metric, i) => <MetricCard key={i} {...metric} />)}
    </div>
  )
}

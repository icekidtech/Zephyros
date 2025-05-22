"use client"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { VerificationBadge } from "./verification-badge"
import { BlockchainAddress } from "@/components/blockchain/blockchain-address"

export interface ActivityItem {
  id: string
  type: "verification" | "registration" | "transfer" | "update"
  title: string
  description?: string
  timestamp: string
  status?: "verified" | "pending" | "rejected" | "unknown"
  address?: string
  productId?: string
}

export interface RecentActivityProps {
  activities?: ActivityItem[]
  className?: string
  isLoading?: boolean
  maxItems?: number
  showViewAll?: boolean
  onViewAll?: () => void
}

export function RecentActivity({
  activities,
  className,
  isLoading = false,
  maxItems = 5,
  showViewAll = true,
  onViewAll,
}: RecentActivityProps) {
  // Default activities if none provided
  const defaultActivities: ActivityItem[] = [
    {
      id: "1",
      type: "verification",
      title: "Product Verified",
      description: "Product #12345 verified at distribution center",
      timestamp: "2 minutes ago",
      status: "verified",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      productId: "12345",
    },
    {
      id: "2",
      type: "registration",
      title: "New Product Registered",
      description: "Premium Coffee Beans batch registered",
      timestamp: "1 hour ago",
      status: "verified",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      productId: "12346",
    },
    {
      id: "3",
      type: "update",
      title: "Supply Chain Updated",
      description: "Added new verification step for quality control",
      timestamp: "3 hours ago",
      status: "pending",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      productId: "12347",
    },
    {
      id: "4",
      type: "transfer",
      title: "Ownership Transferred",
      description: "Product batch transferred to distributor",
      timestamp: "5 hours ago",
      status: "verified",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      productId: "12348",
    },
    {
      id: "5",
      type: "verification",
      title: "Verification Failed",
      description: "Product #12349 failed verification at retail",
      timestamp: "1 day ago",
      status: "rejected",
      address: "0x1234567890abcdef1234567890abcdef12345678",
      productId: "12349",
    },
  ]

  const displayActivities = activities || defaultActivities
  const displayedActivities = displayActivities.slice(0, maxItems)

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex animate-pulse items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full",
                    activity.type === "verification" && "bg-[#43A047]/10 text-[#43A047]",
                    activity.type === "registration" && "bg-[#1E88E5]/10 text-[#1E88E5]",
                    activity.type === "transfer" && "bg-[#FF9800]/10 text-[#FF9800]",
                    activity.type === "update" && "bg-[#00ACC1]/10 text-[#00ACC1]",
                  )}
                >
                  <span className="text-lg font-semibold">{activity.type.charAt(0).toUpperCase()}</span>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{activity.title}</h4>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>

                  {activity.description && <p className="mt-1 text-sm text-muted-foreground">{activity.description}</p>}

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {activity.status && <VerificationBadge variant={activity.status} />}

                    {activity.address && <BlockchainAddress address={activity.address} truncate />}

                    {activity.productId && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                        ID: {activity.productId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {showViewAll && displayActivities.length > maxItems && (
              <button
                onClick={onViewAll}
                className="mt-2 w-full rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-[#1E88E5] hover:bg-[#1E88E5]/5"
              >
                View All Activities
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

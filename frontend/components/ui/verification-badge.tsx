"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, XCircle, AlertTriangle, Loader2 } from "lucide-react"

export type VerificationStatus = "verified" | "pending" | "rejected" | "unknown" | "updating"

export interface VerificationBadgeProps {
  variant?: VerificationStatus
  showIcon?: boolean
  showText?: boolean
  className?: string
  productId?: string
  pollingInterval?: number
}

export function VerificationBadge({
  variant = "unknown",
  showIcon = true,
  showText = true,
  className,
  productId,
  pollingInterval = 10000, // 10 seconds by default
}: VerificationBadgeProps) {
  const [status, setStatus] = useState<VerificationStatus>(variant)
  const [isPolling, setIsPolling] = useState<boolean>(!!productId)

  // Effect for real-time status updates if productId is provided
  useEffect(() => {
    if (!productId || !isPolling) return

    // Initial fetch
    fetchStatus()

    // Set up polling interval
    const intervalId = setInterval(fetchStatus, pollingInterval)

    // Clean up on unmount
    return () => {
      clearInterval(intervalId)
    }
  }, [productId, isPolling, pollingInterval])

  // Function to fetch status from API
  const fetchStatus = async () => {
    if (!productId) return

    try {
      // Set status to updating while fetching
      setStatus("updating")

      // In a real implementation, this would be an API call
      // For demo purposes, we'll simulate an API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Simulate random status updates for demo purposes
      // In a real app, you would fetch the actual status from your API
      const statuses: VerificationStatus[] = ["verified", "pending", "rejected", "unknown"]
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]
      
      setStatus(randomStatus)
    } catch (error) {
      console.error("Error fetching verification status:", error)
      setStatus("unknown")
    }
  }

  // Toggle polling on/off
  const togglePolling = () => {
    setIsPolling(prev => !prev)
  }

  // Determine badge styling based on status
  const badgeVariant = {
    verified: "bg-green-100 text-green-800 hover:bg-green-200",
    pending: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
    rejected: "bg-red-100 text-red-800 hover:bg-red-200",
    unknown: "bg-gray-100 text-gray-800 hover:bg-gray-200",
    updating: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  }[status]

  // Determine icon based on status
  const StatusIcon = {
    verified: CheckCircle,
    pending: Clock,
    rejected: XCircle,
    unknown: AlertTriangle,
    updating: Loader2,
  }[status]

  // Determine text based on status
  const statusText = {
    verified: "Verified",
    pending: "Pending",
    rejected: "Rejected",
    unknown: "Unknown",
    updating: "Updating...",
  }[status]

  return (
    <Badge
      variant="outline"
      className={cn(
        "flex items-center gap-1 font-medium",
        badgeVariant,
        status === "updating" && "animate-pulse",
        className
      )}
      onClick={productId ? togglePolling : undefined}
      style={productId ? { cursor: "pointer" } : undefined}
    >
      {showIcon && <StatusIcon className={cn("h-3.5 w-3.5", status === "updating" && "animate-spin")} />}
      {showText && <span>{statusText}</span>}
    </Badge>
  )
}

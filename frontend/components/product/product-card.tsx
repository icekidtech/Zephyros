"use client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { VerificationBadge } from "../ui/verification-badge"
import { CustomButton } from "../ui/custom-button"
import { Eye, QrCode, ArrowRight } from "lucide-react"

export interface ProductCardProps {
  id: string
  name: string
  description?: string
  image?: string
  status: "verified" | "pending" | "rejected" | "unknown"
  lastUpdated?: string
  supplyChainPosition?: number
  supplyChainTotal?: number
  className?: string
  enableRealTimeStatus?: boolean
}

export function ProductCard({ 
  id, 
  name, 
  description, 
  image, 
  status, 
  lastUpdated, 
  supplyChainPosition = 0,
  supplyChainTotal = 5,
  className,
  enableRealTimeStatus = false
}: ProductCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      {image && (
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-medium">{name}</h3>
            <p className="text-xs text-muted-foreground">ID: {id}</p>
          </div>
          <VerificationBadge 
            variant={status} 
            productId={enableRealTimeStatus ? id : undefined}
            pollingInterval={30000} // Check every 30 seconds
          />
        </div>
      </CardHeader>

      <CardContent>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        {lastUpdated && <p className="mt-2 text-xs text-muted-foreground">Last updated: {lastUpdated}</p>}
        
        {/* Supply Chain Status Flow Indicator */}
        {supplyChainPosition > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-muted-foreground mb-1">Supply Chain Progress</p>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
              <div 
                className={cn(
                  "h-2.5 rounded-full", 
                  status === "verified" ? "bg-green-500" : 
                  status === "pending" ? "bg-yellow-500" : 
                  status === "rejected" ? "bg-red-500" : "bg-gray-300"
                )}
                style={{ width: `${(supplyChainPosition / supplyChainTotal) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
              <span>Manufacturing</span>
              <span>Retail</span>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 pt-0">
        <CustomButton
          variant="outline-brand"
          size="sm"
          className="flex-1"
          leftIcon={<Eye className="h-4 w-4" />}
          asChild
        >
          <Link href={`/products/${id}`}>View Details</Link>
        </CustomButton>

        <CustomButton
          variant="outline-teal"
          size="sm"
          className="flex-1"
          leftIcon={<QrCode className="h-4 w-4" />}
          asChild
        >
          <Link href={`/products/${id}/qr`}>QR Code</Link>
        </CustomButton>
      </CardFooter>
    </Card>
  )
}

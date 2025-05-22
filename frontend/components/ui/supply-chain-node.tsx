"use client"
import { cn } from "@/lib/utils"
import { VerificationBadge } from "./verification-badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export interface SupplyChainNodeProps {
  title: string
  description?: string
  timestamp?: string
  status: "verified" | "pending" | "rejected" | "unknown"
  verifier?: string
  transactionHash?: string
  className?: string
}

export function SupplyChainNode({
  title,
  description,
  timestamp,
  status,
  verifier,
  transactionHash,
  className,
}: SupplyChainNodeProps) {
  return (
    <div className={cn("rounded-lg border p-4", className)}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
        <VerificationBadge variant={status} />
      </div>

      <div className="mt-4 space-y-2 text-sm">
        {timestamp && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Timestamp</span>
            <span>{timestamp}</span>
          </div>
        )}

        {verifier && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Verified by</span>
            <span className="font-mono">{verifier}</span>
          </div>
        )}

        {transactionHash && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Transaction</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-xs">
                {`${transactionHash.substring(0, 6)}...${transactionHash.substring(transactionHash.length - 4)}`}
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="font-mono text-xs">{transactionHash}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

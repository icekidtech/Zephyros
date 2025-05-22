"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Copy, Check, ExternalLink } from "lucide-react"
import { ethers } from "ethers"

export interface BlockchainAddressProps {
  address: string
  truncate?: boolean
  truncateLength?: number
  showCopy?: boolean
  showExplorer?: boolean
  explorerUrl?: string
  explorerName?: string
  className?: string
  network?: "ethereum" | "polygon" | "arbitrum" | "optimism" | "base" | "custom"
}

export function BlockchainAddress({
  address,
  truncate = true,
  truncateLength = 4,
  showCopy = true,
  showExplorer = true,
  explorerUrl,
  explorerName,
  className,
  network = "ethereum",
}: BlockchainAddressProps) {
  const [copied, setCopied] = useState(false)

  // Validate the address
  const isValidAddress = ethers.isAddress(address)

  // Get the explorer URL based on the network
  const getExplorerUrl = () => {
    if (explorerUrl) return `${explorerUrl}/address/${address}`

    const explorers = {
      ethereum: `https://etherscan.io/address/${address}`,
      polygon: `https://polygonscan.com/address/${address}`,
      arbitrum: `https://arbiscan.io/address/${address}`,
      optimism: `https://optimistic.etherscan.io/address/${address}`,
      base: `https://basescan.org/address/${address}`,
      custom: "",
    }

    return explorers[network] || explorers.ethereum
  }

  // Get the explorer name based on the network
  const getExplorerName = () => {
    if (explorerName) return explorerName

    const names = {
      ethereum: "Etherscan",
      polygon: "Polygonscan",
      arbitrum: "Arbiscan",
      optimism: "Optimistic Etherscan",
      base: "Basescan",
      custom: "Explorer",
    }

    return names[network] || names.ethereum
  }

  // Format the address for display
  const formatAddress = () => {
    if (!isValidAddress) return "Invalid Address"
    if (!truncate) return address
    
    const start = address.substring(0, truncateLength + 2)
    const end = address.substring(address.length - truncateLength)
    
    return `${start}...${end}`
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={cn("flex items-center gap-2 font-mono text-sm", className)}>
      <span className={cn("", !isValidAddress && "text-destructive")}>
        {formatAddress()}
      </span>
      
      {isValidAddress && showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
          aria-label="Copy address to clipboard"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </button>
      )}
      
      {isValidAddress && showExplorer && (
        <a
          href={getExplorerUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-6 w-6 items-center justify-center rounded-md hover:bg-muted"
          aria-label={`View on ${getExplorerName()}`}
        >
          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
        </a>
      )}
    </div>
  )
}
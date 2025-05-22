"use client"

import { useState } from "react"
import { Copy, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlockchainAddressProps {
  address: string
  label?: string
  truncate?: boolean
  className?: string
}

export function BlockchainAddress({ address, label, truncate = true, className = "" }: BlockchainAddressProps) {
  const [copied, setCopied] = useState(false)

  const displayAddress = truncate ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : address

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy address:", err)
    }
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && <span className="text-sm text-muted-foreground">{label}:</span>}
      <code className="rounded bg-muted px-2 py-1 font-mono text-sm">{displayAddress}</code>
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={copyToClipboard} title="Copy address">
        {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        <span className="sr-only">Copy address</span>
      </Button>
    </div>
  )
}

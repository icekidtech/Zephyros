"use client"

import * as React from "react"
import { useConnect, useAccount, useDisconnect } from "wagmi"
import { CustomButton } from "../ui/custom-button"
import { toast } from "sonner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, LogOut, Copy, ExternalLink } from "lucide-react"

export function WalletConnectButton() {
  const { connect, connectors, isPending, error } = useConnect({
    onError: (error) => {
      toast.error(`Connection failed: ${error.message}`)
    },
    onSuccess: () => {
      toast.success("Wallet connected successfully!")
    }
  })
  
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      toast.success("Wallet disconnected")
    }
  })
  
  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`
  }
  
  // Handle connection errors
  React.useEffect(() => {
    if (error) {
      let errorMessage = "Failed to connect wallet"
      
      // Enhanced error handling with more specific error types
      if (error.message?.includes("rejected")) {
        errorMessage = "Connection rejected by user"
      } else if (error.message?.includes("already processing")) {
        errorMessage = "Connection already in progress"
      } else if (error.message?.includes("unsupported chain")) {
        errorMessage = "Unsupported blockchain network"
      } else if (error.message?.includes("user denied")) {
        errorMessage = "User denied account access"
      } else if (error.message?.includes("not installed")) {
        errorMessage = "Wallet extension not installed"
      } else if (error.message?.includes("network error")) {
        errorMessage = "Network error. Please check your internet connection"
      } else {
        errorMessage = `Connection error: ${error.message || "Unknown error"}`
      }
      
      toast.error(errorMessage)
    }
  }, [error])
  
  // Copy address to clipboard with error handling
  const copyAddress = () => {
    if (address) {
      try {
        navigator.clipboard.writeText(address)
        toast.success("Address copied to clipboard")
      } catch (error) {
        toast.error("Failed to copy address to clipboard")
        console.error("Clipboard error:", error)
      }
    }
  }
  
  if (isConnected && address) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <CustomButton variant="outline">
            <Wallet className="mr-2 h-4 w-4" />
            {formatAddress(address)}
          </CustomButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
          <DropdownMenuItem onClick={copyAddress}>
            <Copy className="mr-2 h-4 w-4" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => window.open(`https://etherscan.io/address/${address}`, '_blank')}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Etherscan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => disconnect()}>
            <LogOut className="mr-2 h-4 w-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CustomButton 
          variant="outline"
          isLoading={isPending}
        >
          <Wallet className="mr-2 h-4 w-4" />
          Connect Wallet
        </CustomButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Wallet</DropdownMenuLabel>
        {connectors.map((connector) => (
          <DropdownMenuItem
            key={connector.id}
            onClick={() => connect({ connector })}
            disabled={!connector.ready || isPending}
          >
            {connector.name === "MetaMask" && (
              <img src="/icons/metamask.svg" alt="MetaMask" className="mr-2 h-4 w-4" />
            )}
            {connector.name === "WalletConnect" && (
              <img src="/icons/walletconnect.svg" alt="WalletConnect" className="mr-2 h-4 w-4" />
            )}
            {connector.name === "Coinbase Wallet" && (
              <img src="/icons/coinbase.svg" alt="Coinbase Wallet" className="mr-2 h-4 w-4" />
            )}
            {connector.name === "Injected" && (
              <Wallet className="mr-2 h-4 w-4" />
            )}
            {connector.name}
            {!connector.ready && " (unavailable)"}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

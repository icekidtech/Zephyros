"use client"

import { useState } from "react"
import { useAccount, useChainId, useSwitchChain } from "wagmi"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { mainnet, polygon, optimism, arbitrum, base, goerli } from "wagmi/chains"
import { AlertCircle, Check, Loader2 } from "lucide-react"

interface NetworkSwitcherProps {
  className?: string
}

export function NetworkSwitcher({ className = "" }: NetworkSwitcherProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending, error } = useSwitchChain()
  const [selectedChain, setSelectedChain] = useState<number | null>(null)

  // Define supported networks
  const networks = [
    { id: mainnet.id, name: "Ethereum", icon: "🔷" },
    { id: polygon.id, name: "Polygon", icon: "🟣" },
    { id: optimism.id, name: "Optimism", icon: "🔴" },
    { id: arbitrum.id, name: "Arbitrum", icon: "🔵" },
    { id: base.id, name: "Base", icon: "🔘" },
    { id: goerli.id, name: "Goerli (Testnet)", icon: "🧪" },
  ]

  // Get current network name
  const getCurrentNetworkName = () => {
    const network = networks.find(n => n.id === chainId)
    return network ? `${network.icon} ${network.name}` : "Unknown Network"
  }

  // Handle network change with improved error handling
  const handleNetworkChange = (value: string) => {
    try {
      const chainId = parseInt(value)
      if (isNaN(chainId)) {
        throw new Error("Invalid chain ID")
      }
      
      setSelectedChain(chainId)
      switchChain({ chainId })
    } catch (error: any) {
      console.error("Error switching network:", error)
      // Error will be handled by the useSwitchChain hook and displayed in the UI
    }
  }

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Network</CardTitle>
          <CardDescription>Switch between different blockchain networks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4 text-muted-foreground">
            Connect your wallet to switch networks
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Network</CardTitle>
        <CardDescription>Switch between different blockchain networks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span>Currently connected to: {getCurrentNetworkName()}</span>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Switch Network</label>
          <Select onValueChange={(x: string) => handleNetworkChange(x)} value={selectedChain?.toString()}>
            <SelectTrigger>
              <SelectValue placeholder="Select a network" />
            </SelectTrigger>
            <SelectContent>
              {networks.map(network => (
                <SelectItem key={network.id} value={network.id.toString()}>
                  <div className="flex items-center">
                    <span className="mr-2">{network.icon}</span>
                    <span>{network.name}</span>
                    {network.id === chainId && <Check className="ml-2 h-4 w-4" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isPending && (
          <div className="flex items-center space-x-2 text-yellow-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Switching network...</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message || "Failed to switch network"}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
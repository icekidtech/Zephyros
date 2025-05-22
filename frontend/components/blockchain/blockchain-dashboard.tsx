"use client"

import { useState } from "react"
import { useAccount } from "wagmi"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"
import { TokenManager } from "@/components/blockchain/token-manager"
import { NetworkSwitcher } from "@/components/blockchain/network-switcher"
import { TransactionHistory } from "@/components/blockchain/transaction-history"
import { ContractInteraction } from "@/components/blockchain/contract-interaction"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function BlockchainDashboard() {
  const { address, isConnected } = useAccount()
  const [isSimulated, setIsSimulated] = useState(false)

  const handleConnect = (address: string) => {
    console.log("Connected with address:", address)
  }

  const handleDisconnect = () => {
    console.log("Disconnected wallet")
  }

  const handleSimulationToggle = (simulate: boolean) => {
    setIsSimulated(simulate)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold">Blockchain Dashboard</h2>
        <WalletConnectButton 
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isSimulated={isSimulated}
          onSimulationToggle={handleSimulationToggle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TokenManager />
        <NetworkSwitcher />
        <TransactionHistory />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Interaction</CardTitle>
          <CardDescription>Interact with smart contracts on the blockchain</CardDescription>
        </CardHeader>
        <CardContent>
          <ContractInteraction />
        </CardContent>
      </Card>
    </div>
  )
}
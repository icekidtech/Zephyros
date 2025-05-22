"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"
import { GasEstimator } from "@/components/blockchain/gas-estimator"
import { GasOptimizationGuide } from "@/components/blockchain/gas-optimization-guide"
import { useAccount } from "wagmi"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function GasDashboardContent() {
  const { isConnected } = useAccount()
  const [recipientAddress, setRecipientAddress] = useState<string>("")
  const [amount, setAmount] = useState<string>("0.1")

  // Format transaction data for gas estimation
  const getTransactionData = () => {
    if (!recipientAddress) return null
    
    try {
      return {
        to: recipientAddress as `0x${string}`,
        value: BigInt(parseFloat(amount) * 10**18),
      }
    } catch (e) {
      return null
    }
  }

  const transactionData = getTransactionData()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Gas Optimization Dashboard</h1>
      
      <div className="mb-6 flex justify-end">
        <WalletConnectButton />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isConnected ? (
          <>
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Transaction Details</CardTitle>
                  <CardDescription>Enter details to estimate gas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="recipient">Recipient Address</Label>
                      <Input
                        id="recipient"
                        placeholder="0x..."
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount (ETH)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="0.1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {transactionData ? (
                <GasEstimator to={transactionData.to} value={transactionData.value} />
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-muted-foreground">
                      Enter a valid recipient address to estimate gas
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <GasOptimizationGuide />
          </>
        ) : (
          <div className="col-span-2 text-center py-12 bg-gray-50 rounded-lg">
            <p className="mb-4">Please connect your wallet to use the gas dashboard</p>
            <div className="flex justify-center">
              <WalletConnectButton />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function GasDashboardPage() {
  return (
    <WalletProvider>
      <GasDashboardContent />
    </WalletProvider>
  )
}
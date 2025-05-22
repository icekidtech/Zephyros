"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { TokenManager } from "@/components/blockchain/token-manager"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function TestComponent() {
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Token Manager Test</h1>
      
      <div className="space-y-4 mb-8">
        <div>
          <label className="block mb-2">Recipient Address:</label>
          <Input 
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        
        <div>
          <label className="block mb-2">Amount:</label>
          <Input 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
          />
        </div>
        
        <div>
          <label className="block mb-2">Token Address (optional):</label>
          <Input 
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
          />
        </div>
        
        <div className="flex space-x-4">
          <Button onClick={() => {
            // Call your handleEthTransfer function here
            console.log("Send ETH", recipientAddress, amount)
          }}>
            Send ETH
          </Button>
          
          <Button onClick={() => {
            // Call your handleTokenTransfer function here
            console.log("Send Token", recipientAddress, amount, tokenAddress)
          }}>
            Send Token
          </Button>
        </div>
      </div>
      
      <TokenManager />
    </div>
  )
}

export default function TestPage() {
  return (
    <WalletProvider>
      <TestComponent />
    </WalletProvider>
  )
}
"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { useAccount } from "wagmi"

function TestComponent() {
  const { address, isConnected } = useAccount()
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Wallet Provider Test</h1>
      <div className="p-4 border rounded">
        <p>Connection Status: {isConnected ? "Connected" : "Not Connected"}</p>
        {address && <p>Wallet Address: {address}</p>}
      </div>
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
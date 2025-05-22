"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"

export default function TestPage() {
  return (
    <WalletProvider>
      <div className="p-4">
        <h1 className="text-xl font-bold mb-4">Wallet Connect Button Test</h1>
        <WalletConnectButton />
      </div>
    </WalletProvider>
  )
}
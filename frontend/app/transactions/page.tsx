"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"
import { TransactionHistory } from "@/components/blockchain/transaction-history"
import { useAccount } from "wagmi"

function TransactionsContent() {
  const { isConnected } = useAccount()

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
      
      <div className="mb-6 flex justify-end">
        <WalletConnectButton />
      </div>
      
      {isConnected ? (
        <TransactionHistory />
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="mb-4">Please connect your wallet to view your transaction history</p>
          <div className="flex justify-center">
            <WalletConnectButton />
          </div>
        </div>
      )}
    </div>
  )
}

export default function TransactionsPage() {
  return (
    <WalletProvider>
      <TransactionsContent />
    </WalletProvider>
  )
}
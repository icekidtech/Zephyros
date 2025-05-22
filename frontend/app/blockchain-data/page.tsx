"use client"

import { WalletProvider } from "@/components/blockchain/wallet-provider"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"
import { ContractDataViewer } from "@/components/blockchain/contract-data-viewer"

export default function BlockchainDataPage() {
  return (
    <WalletProvider>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-6">Blockchain Data Explorer</h1>
        
        <div className="mb-6 flex justify-end">
          <WalletConnectButton />
        </div>
        
        <div className="mb-8">
          <p className="text-muted-foreground mb-4">
            This page demonstrates reading data directly from smart contracts on the Ethereum blockchain using ethers.js.
            You can view real-time data from popular ERC20 tokens or enter a custom token address.
          </p>
        </div>
        
        <ContractDataViewer />
      </div>
    </WalletProvider>
  )
}
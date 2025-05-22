"use client"

import * as React from "react"
import { createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { injected, metaMask, coinbaseWallet, walletConnect } from "wagmi/connectors"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { useState } from "react"
import { toast } from "sonner"

// Create a React-Query client
const queryClient = new QueryClient()

// Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected(),
    metaMask({
      shimDisconnect: true,
      UNSTABLE_shimOnConnectSelectAccount: true,
    }),
    coinbaseWallet({ 
      appName: "Zephyros II",
      shimDisconnect: true,
    }),
    walletConnect({ 
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
      showQrModal: true,
      metadata: {
        name: "Zephyros II",
        description: "Zephyros II Web Application",
        url: "https://zephyros.app",
        icons: ["https://zephyros.app/logo.png"]
      }
    }),
  ],
})

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Global error handler for wallet connection issues
  const handleConnectionError = (error: Error) => {
    let errorMessage = error.message || "Unknown wallet connection error"
    
    // Categorize common connection errors
    if (errorMessage.includes("already processing")) {
      errorMessage = "Connection already in progress"
    } else if (errorMessage.includes("user rejected")) {
      errorMessage = "Connection rejected by user"
    } else if (errorMessage.includes("unsupported chain")) {
      errorMessage = "Unsupported blockchain network"
    }
    
    setConnectionError(errorMessage)
  }

  // Handle connection errors
  React.useEffect(() => {
    if (connectionError) {
      toast.error(`Wallet Connection Error: ${connectionError}`)
    }
  }, [connectionError])

  // Add global error event listener
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      // Only handle wallet-related errors
      if (event.error?.message?.toLowerCase().includes("wallet") || 
          event.error?.message?.toLowerCase().includes("ethereum")) {
        handleConnectionError(event.error)
      }
    }
    
    window.addEventListener('error', handleError)
    return () => window.removeEventListener('error', handleError)
  }, [])

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
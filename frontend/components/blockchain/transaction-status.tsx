"use client"

import * as React from "react"
import { useWaitForTransactionReceipt } from "wagmi"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

type TransactionStatusType = "pending" | "confirming" | "confirmed" | "failed"

interface TransactionStatusProps {
  status: TransactionStatusType
  txHash?: `0x${string}` | null
  errorMessage?: string
  chainId?: number
}

export function TransactionStatus({ 
  status, 
  txHash, 
  errorMessage = "", 
  chainId = 1 
}: TransactionStatusProps) {
  // Get the appropriate Etherscan URL based on chain ID
  const getEtherscanUrl = () => {
    if (!txHash) return ""
    
    const baseUrl = chainId === 1 
      ? "https://etherscan.io" 
      : chainId === 5 
        ? "https://goerli.etherscan.io"
        : chainId === 11155111
          ? "https://sepolia.etherscan.io"
          : "https://etherscan.io"
    
    return `${baseUrl}/tx/${txHash}`
  }

  switch (status) {
    case "pending":
      return (
        <Alert className="mt-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>Transaction pending...</AlertDescription>
        </Alert>
      )
    case "confirming":
      return (
        <Alert className="mt-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <AlertDescription>
            Confirming transaction...
            {txHash && (
              <a 
                href={getEtherscanUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                View on Etherscan
              </a>
            )}
          </AlertDescription>
        </Alert>
      )
    case "confirmed":
      return (
        <Alert className="mt-4 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
          <AlertDescription className="text-green-700">
            Transaction confirmed!
            {txHash && (
              <a 
                href={getEtherscanUrl()} 
                target="_blank" 
                rel="noopener noreferrer"
                className="ml-2 underline"
              >
                View on Etherscan
              </a>
            )}
          </AlertDescription>
        </Alert>
      )
    case "failed":
      return (
        <Alert className="mt-4 bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
          <AlertDescription className="text-red-700">
            Transaction failed: {errorMessage}
          </AlertDescription>
        </Alert>
      )
    default:
      return null
  }
}

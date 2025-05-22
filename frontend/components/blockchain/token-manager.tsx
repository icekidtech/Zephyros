"use client"

import * as React from "react"
import { useWriteContract, useAccount, useSendTransaction } from "wagmi"
import { parseUnits } from "viem"

export class TokenManager {
  private writeContract: any
  private sendTransaction: any
  private address: `0x${string}` | undefined

  constructor() {
    // These will be initialized when the methods are called
    this.writeContract = null
    this.sendTransaction = null
    this.address = undefined
  }

  async handleTokenTransfer(
    recipientAddress: string, 
    amount: string,
    tokenAddress: `0x${string}`,
    gasSettings?: {
      maxFeePerGas?: bigint
      maxPriorityFeePerGas?: bigint
      gasLimit?: bigint
    }
  ) {
    // Get the current hooks data
    try {
      const { useWriteContract, useAccount } = await import("wagmi")
      const { writeContract } = useWriteContract()
      const { address } = useAccount()
      
      if (!address) throw new Error("Wallet not connected")
      if (!recipientAddress) throw new Error("Recipient address is required")
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Valid amount is required")
      if (!tokenAddress || !tokenAddress.startsWith('0x')) throw new Error("Valid token address is required")
      
      this.writeContract = writeContract
      this.address = address
      
      // For ERC20 token transfers
      const hash = await this.writeContract({
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ name: "success", type: "bool" }]
          },
          {
            name: "decimals",
            type: "function",
            stateMutability: "view",
            inputs: [],
            outputs: [{ name: "", type: "uint8" }]
          }
        ],
        address: tokenAddress,
        functionName: "transfer",
        args: [
          recipientAddress as `0x${string}`, 
          parseUnits(amount, 18) // Default to 18 decimals, should be fetched dynamically
        ],
        // Add gas settings if provided
        ...gasSettings
      })
      
      return { hash }
    } catch (error: any) {
      // Enhanced error handling with specific error types
      if (error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient token balance for this transfer")
      } else if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected by the user")
      } else if (error.message?.includes("gas")) {
        throw new Error("Gas estimation failed: " + error.message)
      } else {
        console.error("Error transferring tokens:", error)
        throw new Error(`Token transfer failed: ${error.message || "Unknown error"}`)
      }
    }
  }
  
  async handleEthTransfer(
    recipientAddress: string, 
    amount: string,
    gasSettings?: {
      maxFeePerGas?: bigint
      maxPriorityFeePerGas?: bigint
      gasLimit?: bigint
    }
  ) {
    try {
      // Get the current hooks data
      const { useSendTransaction, useAccount } = await import("wagmi")
      const { sendTransaction } = useSendTransaction()
      const { address } = useAccount()
      
      if (!address) throw new Error("Wallet not connected")
      if (!recipientAddress) throw new Error("Recipient address is required")
      if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) throw new Error("Valid amount is required")
      
      this.sendTransaction = sendTransaction
      this.address = address
      
      const hash = await this.sendTransaction({
        to: recipientAddress as `0x${string}`,
        value: parseUnits(amount, 18),
        // Add gas settings if provided
        ...gasSettings
      })
      
      return { hash }
    } catch (error: any) {
      // Enhanced error handling with specific error types
      if (error.message?.includes("insufficient funds")) {
        throw new Error("Insufficient ETH balance for this transfer")
      } else if (error.message?.includes("user rejected")) {
        throw new Error("Transaction was rejected by the user")
      } else if (error.message?.includes("gas")) {
        throw new Error("Gas estimation failed: " + error.message)
      } else {
        console.error("Error sending ETH:", error)
        throw new Error(`ETH transfer failed: ${error.message || "Unknown error"}`)
      }
    }
  }
}

// Export the component for backward compatibility
export function TokenManagerComponent() {
  const { address } = useAccount()
  
  const { writeContract, isPending: isWritePending } = useWriteContract()
  
  const { sendTransaction, isPending: isSendPending } = useSendTransaction()
  
  const handleTokenTransfer = async (recipientAddress: string, amount: string) => {
    if (!address) return
    
    try {
      // For ERC20 token transfers
      await writeContract({
        abi: [
          {
            name: "transfer",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "recipient", type: "address" },
              { name: "amount", type: "uint256" }
            ],
            outputs: [{ name: "success", type: "bool" }]
          }
        ],
        address: `0x${recipientAddress.replace(/^0x/, '')}` as `0x${string}`, // Fix: Convert to 0x${string} type
        functionName: "transfer",
        args: [recipientAddress as `0x${string}`, BigInt(amount)] // Fix: Convert amount to BigInt
      })
    } catch (error) {
      console.error("Error transferring tokens:", error)
    }
  }
  
  const handleEthTransfer = async (recipientAddress: string, amount: string) => {
    if (!address) return
    
    try {
      await sendTransaction({
        to: recipientAddress as `0x${string}`, // Fix: Convert to 0x${string} type
        value: BigInt(amount)
      })
    } catch (error) {
      console.error("Error sending ETH:", error)
    }
  }
  
  return (
    <div>
      <h3>Token Manager</h3>
      {/* Implement your token manager UI here */}
    </div>
  )
}
"use client"

import { useState, useCallback } from "react"
import type { ContractTransaction, ContractReceipt } from "ethers"

type TransactionStatus = "idle" | "pending" | "success" | "error"

interface UseTransactionReturn {
  executeTransaction: <T extends any[]>(
    contractMethod: (...args: T) => Promise<ContractTransaction>,
    ...args: T
  ) => Promise<ContractReceipt>
  status: TransactionStatus
  txHash: string | null
  receipt: ContractReceipt | null
  error: Error | null
  resetState: () => void
}

/**
 * A React hook for executing and tracking Ethereum transactions
 * Works with both real and simulated contracts
 *
 * @returns An object containing the transaction execution function and status information
 */
export function useTransaction(): UseTransactionReturn {
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [txHash, setTxHash] = useState<string | null>(null)
  const [receipt, setReceipt] = useState<ContractReceipt | null>(null)
  const [error, setError] = useState<Error | null>(null)

  const executeTransaction = useCallback(
    async <T extends any[]>(
      contractMethod: (...args: T) => Promise<ContractTransaction>,
      ...args: T
    ): Promise<ContractReceipt> => {
      try {
        setStatus("pending")
        setError(null)

        // Execute the transaction
        const tx = await contractMethod(...args)
        setTxHash(tx.hash)

        // Wait for the transaction to be mined
        const receipt = await tx.wait()
        setReceipt(receipt)
        setStatus("success")
        return receipt
      } catch (err) {
        console.error("Transaction error:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setStatus("error")
        throw err
      }
    },
    [],
  )

  const resetState = useCallback(() => {
    setStatus("idle")
    setTxHash(null)
    setReceipt(null)
    setError(null)
  }, [])

  return {
    executeTransaction,
    status,
    txHash,
    receipt,
    error,
    resetState,
  }
}

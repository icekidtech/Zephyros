"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { erc20ABI } from "@/lib/blockchain/abis"

interface UseContractReadOptions {
  contractAddress: string
  abi: any[]
  functionName: string
  args?: any[]
  enabled?: boolean
  refreshInterval?: number
}

interface UseContractReadReturn<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
  blockNumber: number | null
  lastUpdated: Date | null
}

export function useContractRead<T = any>({
  contractAddress,
  abi,
  functionName,
  args = [],
  enabled = true,
  refreshInterval = 0,
}: UseContractReadOptions): UseContractReadReturn<T> {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchData = useCallback(async () => {
    if (!enabled || !contractAddress || !functionName) return

    try {
      setIsLoading(true)
      setError(null)

      let provider: ethers.providers.Provider

      // Check if we're in a browser environment with MetaMask
      if (typeof window !== "undefined" && window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum)
      } else {
        // Fallback to public provider (Infura, Alchemy, etc.)
        provider = ethers.getDefaultProvider("mainnet", {
          infura: process.env.NEXT_PUBLIC_INFURA_KEY,
          alchemy: process.env.NEXT_PUBLIC_ALCHEMY_KEY,
          etherscan: process.env.NEXT_PUBLIC_ETHERSCAN_KEY,
        })
      }

      const contract = new ethers.Contract(contractAddress, abi, provider)
      
      // Call the contract function
      const result = await contract[functionName](...args)
      
      // Get current block number
      const currentBlock = await provider.getBlockNumber()
      
      setData(result)
      setBlockNumber(currentBlock)
      setLastUpdated(new Date())
    } catch (err) {
      console.error(`Error reading contract data for ${functionName}:`, err)
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setIsLoading(false)
    }
  }, [contractAddress, abi, functionName, args, enabled])

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Set up refresh interval if specified
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return

    const intervalId = setInterval(fetchData, refreshInterval)
    
    return () => clearInterval(intervalId)
  }, [fetchData, refreshInterval])

  const refetch = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  return {
    data,
    isLoading,
    error,
    refetch,
    blockNumber,
    lastUpdated
  }
}

// Utility hook for reading ERC20 token data
export function useERC20TokenData(tokenAddress: string, enabled = true) {
  const { data: name, isLoading: nameLoading, error: nameError } = useContractRead<string>({
    contractAddress: tokenAddress,
    abi: erc20ABI,
    functionName: 'name',
    enabled
  })

  const { data: symbol, isLoading: symbolLoading, error: symbolError } = useContractRead<string>({
    contractAddress: tokenAddress,
    abi: erc20ABI,
    functionName: 'symbol',
    enabled
  })

  const { data: decimals, isLoading: decimalsLoading, error: decimalsError } = useContractRead<number>({
    contractAddress: tokenAddress,
    abi: erc20ABI,
    functionName: 'decimals',
    enabled
  })

  const { data: totalSupply, isLoading: totalSupplyLoading, error: totalSupplyError } = useContractRead<ethers.BigNumber>({
    contractAddress: tokenAddress,
    abi: erc20ABI,
    functionName: 'totalSupply',
    enabled
  })

  const isLoading = nameLoading || symbolLoading || decimalsLoading || totalSupplyLoading
  const error = nameError || symbolError || decimalsError || totalSupplyError

  return {
    name,
    symbol,
    decimals,
    totalSupply: totalSupply ? ethers.utils.formatUnits(totalSupply, decimals || 18) : null,
    isLoading,
    error
  }
}
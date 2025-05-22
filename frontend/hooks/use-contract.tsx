"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import type { Contract } from "ethers"

// Define the return type for the hook
interface UseContractReturn {
  contract: Contract | null
  loading: boolean
  error: Error | null
  reconnect: () => Promise<void>
  address: string | null
  network: string | null
  isSimulated: boolean
}

// Define the ABI type
type ABI = any[]

/**
 * A React hook for interacting with Ethereum smart contracts
 * Falls back to simulation mode when no provider is available
 *
 * @param contractAddress - The address of the smart contract
 * @param abi - The ABI (Application Binary Interface) of the smart contract
 * @returns An object containing the contract instance, loading state, error state, and reconnect function
 */
export function useContract(contractAddress: string, abi: ABI): UseContractReturn {
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [network, setNetwork] = useState<string | null>(null)
  const [isSimulated, setIsSimulated] = useState<boolean>(false)

  const createSimulatedContract = useCallback(() => {
    // Create a simulated contract for demo purposes
    const simulatedProvider = new ethers.providers.JsonRpcProvider()
    const simulatedSigner = simulatedProvider.getSigner()

    // Create a mock contract with the same interface
    const mockContract = new ethers.Contract(contractAddress, abi, simulatedSigner)

    // Override methods to return simulated data
    const originalCall = mockContract.call.bind(mockContract)
    mockContract.call = async (method: string, ...args: any[]) => {
      console.log(`Simulated call to ${method} with args:`, args)

      // Simulate getSupplyChainStatus method
      if (method === "getSupplyChainStatus") {
        return Promise.resolve("Simulated: Product in transit to distribution center")
      }

      return originalCall(method, ...args)
    }

    // Override methods to simulate transactions
    abi.forEach((item: any) => {
      if (item.name && item.type !== "event") {
        const originalMethod = mockContract[item.name]
        mockContract[item.name] = async (...args: any[]) => {
          console.log(`Simulated call to ${item.name} with args:`, args)

          if (item.stateMutability === "view") {
            if (item.name === "getSupplyChainStatus") {
              return "Simulated: Product in transit to distribution center"
            }
            return "Simulated data"
          } else {
            // For non-view functions, return a simulated transaction
            return {
              hash:
                "0x" +
                Array(64)
                  .fill(0)
                  .map(() => Math.floor(Math.random() * 16).toString(16))
                  .join(""),
              wait: () => Promise.resolve({ status: 1 }),
            }
          }
        }
      }
    })

    return mockContract
  }, [contractAddress, abi])

  const initContract = useCallback(async () => {
    if (!contractAddress || !abi) {
      setError(new Error("Contract address or ABI not provided"))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Check if we're in a browser environment
      if (typeof window === "undefined") {
        setIsSimulated(true)
        const mockContract = createSimulatedContract()
        setContract(mockContract)
        setAddress("0xSimulated_Address_For_Demo_Purposes_Only")
        setNetwork("Simulated Network")
        return
      }

      // Check if window.ethereum exists
      if (!window.ethereum) {
        console.log("No Ethereum provider found. Using simulation mode.")
        setIsSimulated(true)
        const mockContract = createSimulatedContract()
        setContract(mockContract)
        setAddress("0xSimulated_Address_For_Demo_Purposes_Only")
        setNetwork("Simulated Network")
        return
      }

      // Real provider available, proceed normally
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts && accounts.length > 0) {
        setAddress(accounts[0])
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const signer = provider.getSigner()

      const networkData = await provider.getNetwork()
      setNetwork(networkData.name)

      const contractInstance = new ethers.Contract(contractAddress, abi, signer)
      setContract(contractInstance)
      setIsSimulated(false)
    } catch (err) {
      console.error("Error initializing contract:", err)

      // Fall back to simulation mode on error
      console.log("Falling back to simulation mode due to error")
      setIsSimulated(true)
      const mockContract = createSimulatedContract()
      setContract(mockContract)
      setAddress("0xSimulated_Address_For_Demo_Purposes_Only")
      setNetwork("Simulated Network")

      // Still set the error for debugging purposes
      setError(err instanceof Error ? err : new Error(String(err)))
    } finally {
      setLoading(false)
    }
  }, [contractAddress, abi, createSimulatedContract])

  useEffect(() => {
    initContract()

    // Only set up event listeners if we have a real provider
    if (typeof window !== "undefined" && window.ethereum && !isSimulated) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          setAddress(null)
          setContract(null)
        } else {
          setAddress(accounts[0])
          initContract()
        }
      }

      const handleChainChanged = () => {
        window.location.reload()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
      }
    }
  }, [initContract, isSimulated])

  const reconnect = useCallback(async () => {
    await initContract()
  }, [initContract])

  return { contract, loading, error, reconnect, address, network, isSimulated }
}

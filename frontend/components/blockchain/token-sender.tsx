"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useAccount, useBalance, useToken, useWaitForTransactionReceipt } from "wagmi"
import { parseUnits } from "viem"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CustomButton } from "@/components/ui/custom-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { GasEstimator } from "./gas-estimator"

// Common ERC20 tokens with their addresses
const COMMON_TOKENS = [
  { symbol: "ETH", name: "Ethereum", address: null, decimals: 18 },
  { 
    symbol: "USDT", 
    name: "Tether USD", 
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", 
    decimals: 6 
  },
  { 
    symbol: "USDC", 
    name: "USD Coin", 
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", 
    decimals: 6 
  },
  { 
    symbol: "DAI", 
    name: "Dai Stablecoin", 
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", 
    decimals: 18 
  },
]

// Transaction status types
type TransactionStatus = "idle" | "preparing" | "pending" | "confirming" | "confirmed" | "failed"

export function TokenSender() {
  const { address } = useAccount()
  const [recipientAddress, setRecipientAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [selectedToken, setSelectedToken] = useState<string>("ETH")
  const [customTokenAddress, setCustomTokenAddress] = useState("")
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [status, setStatus] = useState<TransactionStatus>("idle")
  const [errorMessage, setErrorMessage] = useState("")
  
  // Get token data for custom token
  const { data: tokenData } = useToken({
    address: customTokenAddress as `0x${string}`,
    enabled: customTokenAddress !== "",
  })
  
  // Get user's ETH balance
  const { data: ethBalance } = useBalance({
    address: address,
  })
  
  // Get selected token balance
  const selectedTokenObj = COMMON_TOKENS.find(t => t.symbol === selectedToken) || 
    (customTokenAddress ? { 
      symbol: tokenData?.symbol || "Unknown", 
      name: tokenData?.name || "Custom Token", 
      address: customTokenAddress, 
      decimals: tokenData?.decimals || 18 
    } : COMMON_TOKENS[0])
  
  // Get token balance if it's not ETH
  const { data: tokenBalance } = useBalance({
    address: address,
    token: selectedTokenObj.address as `0x${string}`,
    enabled: selectedToken !== "ETH" && !!address,
  })
  
  // Wait for transaction receipt
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash: txHash,
    enabled: txHash !== null,
  })
  
  // Update status based on transaction state
  useEffect(() => {
    if (status === "pending" && isConfirming) {
      setStatus("confirming")
    } else if (status === "confirming" && isConfirmed) {
      setStatus("confirmed")
      toast.success("Transaction confirmed!")
    }
  }, [isConfirming, isConfirmed, status])
  
  // Handle token selection
  const handleTokenSelect = (value: string) => {
    setSelectedToken(value)
    if (value === "custom") {
      setCustomTokenAddress("")
    }
  }
  
  // Handle sending tokens with improved validation and error handling
  const handleSendTokens = async () => {
    // Reset previous errors
    setErrorMessage("")
    
    // Input validation
    if (!address) {
      setErrorMessage("Wallet not connected")
      return
    }
    
    if (!recipientAddress) {
      setErrorMessage("Recipient address is required")
      return
    }
    
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 42) {
      setErrorMessage("Invalid recipient address format")
      return
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setErrorMessage("Please enter a valid amount greater than 0")
      return
    }
    
    // Check if user has sufficient balance
    const currentBalanceNum = currentBalance ? Number(currentBalance) : 0
    const amountNum = Number(amount)
    
    if (amountNum > currentBalanceNum) {
      setErrorMessage(`Insufficient balance. You have ${currentBalanceNum} ${selectedTokenObj.symbol}`)
      return
    }
  
    try {
      setStatus("preparing")
  
      // Format recipient address
      const formattedRecipient = recipientAddress as `0x${string}`
      
      // Determine if sending ETH or tokens
      if (selectedToken === "ETH") {
        // Import and use the token manager's handleEthTransfer function
        const { TokenManager } = await import("./token-manager")
        const tokenManager = new TokenManager()
        
        setStatus("pending")
        const result = await tokenManager.handleEthTransfer(
          recipientAddress, 
          amount,
          gasSettings // Pass gas settings
        )
        setTxHash(result.hash)
      } else {
        // Import and use the token manager's handleTokenTransfer function
        const { TokenManager } = await import("./token-manager")
        const tokenManager = new TokenManager()
        
        if (!selectedTokenObj.address) {
          throw new Error("Token address is required")
        }
        
        const tokenAddress = selectedTokenObj.address as `0x${string}`
        
        setStatus("pending")
        const result = await tokenManager.handleTokenTransfer(
          recipientAddress, 
          amount,
          tokenAddress,
          gasSettings // Pass gas settings
        )
        setTxHash(result.hash)
      }
    } catch (error: any) {
      console.error("Transaction error:", error)
      setStatus("failed")
      
      // Provide more specific error messages based on error type
      if (error.message?.includes("insufficient funds")) {
        setErrorMessage("Insufficient funds for this transaction")
      } else if (error.message?.includes("user rejected")) {
        setErrorMessage("Transaction rejected by user")
      } else if (error.message?.includes("gas")) {
        setErrorMessage("Gas estimation failed: " + error.message)
      } else {
        setErrorMessage(error.message || "Transaction failed")
      }
      
      toast.error(`Transaction failed: ${error.message || "Unknown error"}`)
    }
  }
  
  // Reset the form
  const resetForm = () => {
    setRecipientAddress("")
    setAmount("")
    setTxHash(null)
    setStatus("idle")
    setErrorMessage("")
  }
  
  // Get current balance display
  const currentBalance = selectedToken === "ETH" 
    ? ethBalance?.formatted 
    : tokenBalance?.formatted
  
  // Render transaction status
  const renderTransactionStatus = () => {
    switch (status) {
      case "preparing":
        return (
          <Alert className="mt-4">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <AlertDescription>Preparing transaction...</AlertDescription>
          </Alert>
        )
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
                  href={`https://etherscan.io/tx/${txHash}`} 
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
                  href={`https://etherscan.io/tx/${txHash}`} 
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

  // Calculate transaction data for gas estimation
  const getTransactionData = (): { to?: `0x${string}`; value?: bigint; data?: `0x${string}` } => {
    if (!recipientAddress) return {}
    
    try {
      const to = recipientAddress as `0x${string}`
      
      if (selectedToken === "ETH" && amount) {
        // For ETH transfers
        return {
          to,
          value: parseUnits(amount || "0", 18),
        }
      } else if (selectedTokenObj.address && amount) {
        // For token transfers, we need to create the contract call data
        // This is a simplified example - in production you'd use a library like ethers.js
        // to encode the function call properly
        return {
          to: selectedTokenObj.address as `0x${string}`,
          value: 0n,
          // This is a placeholder - you'd need proper ABI encoding
          data: "0xa9059cbb" as `0x${string}`, // transfer function signature
        }
      }
    } catch (e) {
      console.error("Error preparing transaction data:", e)
    }
    
    return {}
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Send Tokens</CardTitle>
        <CardDescription>Transfer tokens to another wallet</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Recipient Address */}
        <div className="space-y-2">
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            placeholder="0x..."
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            disabled={status !== "idle" && status !== "failed"}
          />
        </div>

        {/* Token Selection */}
        <div className="space-y-2">
          <Label htmlFor="token">Token</Label>
          <Select 
            value={selectedToken} 
            onValueChange={handleTokenSelect}
            disabled={status !== "idle" && status !== "failed"}
          >
            <SelectTrigger id="token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {COMMON_TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  {token.symbol} - {token.name}
                </SelectItem>
              ))}
              <SelectItem value="custom">Custom Token</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Token Address */}
        {selectedToken === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="customToken">Custom Token Address</Label>
            <Input
              id="customToken"
              placeholder="0x..."
              value={customTokenAddress}
              onChange={(e) => setCustomTokenAddress(e.target.value)}
              disabled={status !== "idle" && status !== "failed"}
            />
          </div>
        )}

        {/* Amount */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="amount">Amount</Label>
            {currentBalance && (
              <span className="text-xs text-gray-500">
                Balance: {currentBalance} {selectedTokenObj.symbol}
              </span>
            )}
          </div>
          <Input
            id="amount"
            type="number"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            disabled={status !== "idle" && status !== "failed"}
          />
        </div>

        {/* Transaction Status */}
        {renderTransactionStatus()}
      </CardContent>
      <CardFooter className="flex justify-between">
        {(status === "confirmed" || status === "failed") && (
          <CustomButton 
            variant="outline" 
            onClick={resetForm}
          >
            Reset
          </CustomButton>
        )}
        
        <CustomButton
          onClick={handleSendTokens}
          disabled={!address || status === "pending" || status === "confirming" || status === "preparing"}
          isLoading={status === "pending" || status === "confirming" || status === "preparing"}
        >
          Send {selectedTokenObj.symbol}
        </CustomButton>
      </CardFooter>
      
      {/* Add Gas Estimator */}
      {address && recipientAddress && amount && (
        <div className="mt-6">
          <GasEstimator
            {...getTransactionData()}
            onGasSettingsChange={handleGasSettingsChange}
          />
        </div>
      )}
    </Card>
  )
}
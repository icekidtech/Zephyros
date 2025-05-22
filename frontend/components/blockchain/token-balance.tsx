"use client"

import { useState } from "react"
import { useAccount, useBalance, useToken } from "wagmi"
import { formatUnits } from "ethers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle } from "lucide-react"

interface TokenBalanceProps {
  defaultTokenAddress?: `0x${string}`
  className?: string
}

export function TokenBalance({ defaultTokenAddress, className = "" }: TokenBalanceProps) {
  const { address } = useAccount()
  const [tokenAddress, setTokenAddress] = useState<`0x${string}` | undefined>(defaultTokenAddress)
  const [inputValue, setInputValue] = useState<string>(defaultTokenAddress || "")
  const [error, setError] = useState<string | null>(null)

  // Native token balance
  const { data: nativeBalance, isLoading: isLoadingNative } = useBalance({
    address,
    // Remove watch property
  })

  // Token data
  const { data: tokenData, isLoading: isLoadingTokenData } = useToken({
    address: tokenAddress,
    // Remove enabled property
  })

  // Token balance
  const { data: tokenBalance, isLoading: isLoadingTokenBalance } = useBalance({
    address,
    token: tokenAddress,
    // Remove watch property
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!inputValue) {
      setTokenAddress(undefined)
      return
    }

    // Improved validation with more specific error messages
    if (!inputValue.startsWith("0x")) {
      setError("Token address must start with '0x'")
      return
    }
    
    if (inputValue.length !== 42) {
      setError("Token address must be 42 characters long (including '0x')")
      return
    }
    
    // Additional validation for hexadecimal format
    if (!/^0x[0-9a-fA-F]{40}$/.test(inputValue)) {
      setError("Token address must contain only hexadecimal characters")
      return
    }

    setTokenAddress(inputValue as `0x${string}`)
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Token Balance</CardTitle>
        <CardDescription>View your token balances</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!address ? (
          <div className="text-center text-muted-foreground">
            Connect your wallet to view balances
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Native Token</h3>
              {isLoadingNative ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Loading balance...</span>
                </div>
              ) : nativeBalance ? (
                <div className="rounded-md border p-4">
                  <div className="flex justify-between">
                    <span className="font-medium">{nativeBalance.symbol}</span>
                    <span>{parseFloat(nativeBalance.formatted).toFixed(4)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground">No balance data</div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2">
              <h3 className="text-lg font-medium">ERC20 Token</h3>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter token address (0x...)"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
                <Button type="submit">Check</Button>
              </div>
              
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </form>

            {tokenAddress && (
              <div className="space-y-2">
                {(isLoadingTokenData || isLoadingTokenBalance) ? (
                  <div className="flex items-center justify-center py-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Loading token data...</span>
                  </div>
                ) : tokenData && tokenBalance ? (
                  <div className="rounded-md border p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{tokenData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Symbol:</span>
                      <span>{tokenData.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Balance:</span>
                      <span>{parseFloat(tokenBalance.formatted).toFixed(4)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    No token data found
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
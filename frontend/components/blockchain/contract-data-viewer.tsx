"use client"

import { useState } from "react"
import { useContractRead, useERC20TokenData } from "@/hooks/use-contract-read"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, RefreshCw } from "lucide-react"
import { ethers } from "ethers"

// Popular tokens on Ethereum mainnet
const POPULAR_TOKENS = [
  {
    name: "USD Coin",
    symbol: "USDC",
    address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
  },
  {
    name: "Tether USD",
    symbol: "USDT",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  },
  {
    name: "Dai Stablecoin",
    symbol: "DAI",
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F"
  },
  {
    name: "Wrapped Ether",
    symbol: "WETH",
    address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
  },
  {
    name: "Chainlink",
    symbol: "LINK",
    address: "0x514910771AF9Ca656af840dff83E8264EcF986CA"
  }
]

export function ContractDataViewer() {
  const [tokenAddress, setTokenAddress] = useState<string>(POPULAR_TOKENS[0].address)
  const [customAddress, setCustomAddress] = useState<string>("")
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0)

  const {
    name,
    symbol,
    decimals,
    totalSupply,
    isLoading,
    error
  } = useERC20TokenData(tokenAddress, true)

  // Get token holder count from Etherscan API
  const { 
    data: holderCount, 
    isLoading: holderCountLoading,
    refetch: refetchHolderCount
  } = useContractRead<number>({
    contractAddress: "0x0000000000000000000000000000000000000000", // Dummy address, not actually used
    abi: [], // Empty ABI as we're not actually calling a contract function
    functionName: "dummy",
    enabled: false // Disable automatic fetching
  })

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  const handleCustomAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (ethers.utils.isAddress(customAddress)) {
      setTokenAddress(customAddress)
    }
  }

  const getEtherscanLink = (address: string) => {
    return `https://etherscan.io/token/${address}`
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>On-Chain Token Data</CardTitle>
        <CardDescription>
          View real-time data from ERC20 tokens on Ethereum mainnet
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Token selector */}
        <div className="mb-6">
          <Label htmlFor="token-select" className="mb-2 block">Select a token</Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TOKENS.map((token) => (
              <Badge
                key={token.address}
                variant={tokenAddress === token.address ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setTokenAddress(token.address)}
              >
                {token.symbol}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Custom token address input */}
        <form onSubmit={handleCustomAddressSubmit} className="mb-6">
          <Label htmlFor="custom-address" className="mb-2 block">Or enter a custom token address</Label>
          <div className="flex gap-2">
            <Input
              id="custom-address"
              placeholder="0x..."
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={!customAddress || !ethers.utils.isAddress(customAddress)}>
              Load
            </Button>
          </div>
        </form>
        
        {/* Token data display */}
        <div className="space-y-4 bg-muted/50 p-4 rounded-md">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">Token Data</h3>
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
          
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ) : error ? (
            <div className="text-destructive p-4 border border-destructive/20 rounded-md">
              Error loading token data: {error.message}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Symbol</p>
                <p className="font-medium">{symbol}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Decimals</p>
                <p className="font-medium">{decimals !== null ? decimals : 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Supply</p>
                <p className="font-medium">{totalSupply !== null ? totalSupply : 'N/A'}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <a 
          href={getEtherscanLink(tokenAddress)} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm flex items-center text-blue-600 hover:underline"
        >
          View on Etherscan
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
        <p className="text-xs text-muted-foreground">
          Data fetched directly from the Ethereum blockchain
        </p>
      </CardFooter>
    </Card>
  )
}
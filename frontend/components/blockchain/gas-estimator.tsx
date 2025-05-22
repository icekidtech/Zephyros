"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useEstimateGas, useGasPrice, useFeeData, useAccount, useChainId } from "wagmi"
import { parseUnits, formatUnits, formatEther } from "viem"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { InfoIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface GasEstimatorProps {
  to?: `0x${string}`
  value?: bigint
  data?: `0x${string}`
  onGasSettingsChange?: (settings: {
    maxFeePerGas?: bigint
    maxPriorityFeePerGas?: bigint
    gasLimit?: bigint
  }) => void
  className?: string
}

export function GasEstimator({ to, value = 0n, data, onGasSettingsChange, className }: GasEstimatorProps) {
  const { address } = useAccount()
  const chainId = useChainId()
  const [gasLimit, setGasLimit] = useState<bigint | undefined>()
  const [priorityFee, setPriorityFee] = useState<number>(1) // in gwei
  const [selectedSpeed, setSelectedSpeed] = useState<string>("standard")
  
  // Get current gas price and fee data
  const { data: gasPrice } = useGasPrice()
  const { data: feeData } = useFeeData()
  
  // Estimate gas for the transaction
  const { data: estimatedGas, isLoading: isEstimatingGas } = useEstimateGas({
    to,
    value,
    data,
    account: address,
    // Remove the enabled property
  })
  
  // Update gas limit when estimation changes
  useEffect(() => {
    if (estimatedGas) {
      // Add 10% buffer to estimated gas
      const bufferedGas = (estimatedGas * 110n) / 100n
      setGasLimit(bufferedGas)
    }
  }, [estimatedGas])
  
  // Calculate gas costs based on current settings
  const calculateGasCost = () => {
    if (!gasLimit || !feeData) return null
    
    let maxFeePerGas: bigint
    let maxPriorityFeePerGas: bigint
    
    // EIP-1559 transaction
    if (feeData.maxFeePerGas) {
      // Adjust based on selected speed
      const baseFeeMultiplier = selectedSpeed === "fast" ? 1.2 : 
                               selectedSpeed === "slow" ? 0.8 : 1
      
      maxFeePerGas = BigInt(Math.floor(Number(feeData.maxFeePerGas) * baseFeeMultiplier))
      maxPriorityFeePerGas = parseUnits(priorityFee.toString(), 9) // Convert gwei to wei
      
      // Ensure maxFeePerGas is at least baseFee + maxPriorityFeePerGas
      if (feeData.gasPrice && maxFeePerGas < feeData.gasPrice + maxPriorityFeePerGas) {
        maxFeePerGas = feeData.gasPrice + maxPriorityFeePerGas
      }
      
      // Calculate total cost (worst case)
      const totalCost = maxFeePerGas * gasLimit
      
      // Notify parent component of gas settings
      if (onGasSettingsChange) {
        onGasSettingsChange({
          maxFeePerGas,
          maxPriorityFeePerGas,
          gasLimit,
        })
      }
      
      return {
        gasLimit,
        maxFeePerGas,
        maxPriorityFeePerGas,
        totalCost,
        baseFee: feeData.gasPrice,
      }
    } 
    // Legacy transaction
    else if (gasPrice) {
      const adjustedGasPrice = BigInt(Math.floor(Number(gasPrice) * 
        (selectedSpeed === "fast" ? 1.2 : selectedSpeed === "slow" ? 0.8 : 1)))
      
      const totalCost = adjustedGasPrice * gasLimit
      
      // Notify parent component of gas settings
      if (onGasSettingsChange) {
        onGasSettingsChange({
          gasLimit,
        })
      }
      
      return {
        gasLimit,
        gasPrice: adjustedGasPrice,
        totalCost,
      }
    }
    
    return null
  }
  
  const gasCost = calculateGasCost()
  
  // Format gas values for display
  const formatGasValue = (value: bigint) => {
    return `${parseFloat(formatUnits(value, 9)).toFixed(2)} Gwei`
  }
  
  // Format total cost in ETH
  const formatTotalCost = (value: bigint) => {
    return `${parseFloat(formatEther(value)).toFixed(6)} ETH`
  }
  
  // Get USD value (would need price feed integration)
  const getUsdValue = (ethValue: bigint) => {
    // This is a placeholder - you would need to integrate a price feed
    const ethPrice = 2500 // Example ETH price in USD
    return (Number(formatEther(ethValue)) * ethPrice).toFixed(2)
  }
  
  // Get optimization tips based on current settings
  const getOptimizationTips = () => {
    const tips = []
    
    if (selectedSpeed === "fast") {
      tips.push("Consider using 'Standard' speed to save ~20% on gas fees")
    }
    
    if (priorityFee > 1.5) {
      tips.push("Reducing priority fee can lower transaction costs")
    }
    
    if (chainId === 1) { // Ethereum mainnet
      tips.push("Consider using Layer 2 solutions like Optimism or Arbitrum for lower fees")
    }
    
    return tips
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Estimator</CardTitle>
        <CardDescription>Estimate and optimize transaction gas costs</CardDescription>
      </CardHeader>
      <CardContent>
        {isEstimatingGas ? (
          <div className="text-center py-4">Estimating gas...</div>
        ) : !to ? (
          <div className="text-center py-4">Enter transaction details to estimate gas</div>
        ) : (
          <>
            <Tabs defaultValue="standard" value={selectedSpeed} onValueChange={setSelectedSpeed}>
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="slow">Slow</TabsTrigger>
                <TabsTrigger value="standard">Standard</TabsTrigger>
                <TabsTrigger value="fast">Fast</TabsTrigger>
              </TabsList>
              
              <TabsContent value="slow">
                <p className="text-sm text-gray-500 mb-4">
                  Lower cost, but may take longer to confirm (5+ minutes)
                </p>
              </TabsContent>
              <TabsContent value="standard">
                <p className="text-sm text-gray-500 mb-4">
                  Balanced cost and confirmation time (1-3 minutes)
                </p>
              </TabsContent>
              <TabsContent value="fast">
                <p className="text-sm text-gray-500 mb-4">
                  Higher cost for faster confirmation (under 1 minute)
                </p>
              </TabsContent>
            </Tabs>
            
            {feeData?.maxFeePerGas && (
              <div className="space-y-4 mb-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Priority Fee (Tip)</Label>
                    <span className="text-sm">{priorityFee.toFixed(1)} Gwei</span>
                  </div>
                  <Slider
                    value={[priorityFee]}
                    min={0.1}
                    max={5}
                    step={0.1}
                    onValueChange={(values) => setPriorityFee(values[0])}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Higher priority fee can result in faster confirmation
                  </p>
                </div>
              </div>
            )}
            
            {gasCost && (
              <div className="space-y-2 mt-4 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-sm">Gas Limit:</span>
                  <span className="text-sm font-medium">{String(gasCost.gasLimit)}</span>
                </div>
                
                {gasCost.maxFeePerGas !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm">Max Fee:</span>
                    <span className="text-sm font-medium">{formatGasValue(gasCost.maxFeePerGas)}</span>
                  </div>
                )}
                
                {gasCost.maxPriorityFeePerGas !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm">Priority Fee:</span>
                    <span className="text-sm font-medium">{formatGasValue(gasCost.maxPriorityFeePerGas)}</span>
                  </div>
                )}
                
                {gasCost.gasPrice !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-sm">Gas Price:</span>
                    <span className="text-sm font-medium">{formatGasValue(gasCost.gasPrice)}</span>
                  </div>
                )}
                
                <div className="flex justify-between border-t pt-2 mt-2">
                  <span className="text-sm font-medium">Estimated Cost:</span>
                  <div className="text-right">
                    <div className="text-sm font-medium">{formatTotalCost(gasCost.totalCost)}</div>
                    <div className="text-xs text-gray-500">≈ ${getUsdValue(gasCost.totalCost)}</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-6">
              <Alert>
                <InfoIcon className="h-4 w-4 mr-2" />
                <AlertDescription>
                  <p className="text-sm font-medium mb-1">Gas Saving Tips:</p>
                  <ul className="text-xs list-disc pl-4 space-y-1">
                    {getOptimizationTips().map((tip, index) => (
                      <li key={index}>{tip}</li>
                    ))}
                    <li>Transactions during weekends or off-peak hours (UTC 0-4) often have lower fees</li>
                    <li>Batch multiple operations into a single transaction when possible</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

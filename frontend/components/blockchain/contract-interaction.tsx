"use client"

import { useState } from "react"
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from "wagmi"
import { parseAbiItem } from "viem"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Code, Loader2 } from "lucide-react"

interface ContractInteractionProps {
  contractAddress?: `0x${string}`
  contractAbi?: any[]
}

export function ContractInteraction({ contractAddress, contractAbi }: ContractInteractionProps) {
  const [customAbi, setCustomAbi] = useState<string>("")
  const [functionName, setFunctionName] = useState<string>("")
  const [functionArgs, setFunctionArgs] = useState<string>("")
  const [readResult, setReadResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Parse ABI and arguments
  const parsedAbi = contractAbi || (customAbi ? JSON.parse(customAbi) : [])
  const parsedArgs = functionArgs ? functionArgs.split(",").map(arg => arg.trim()) : []
  
  // Contract read operation
  const { data: readData, isLoading: isReadLoading, error: readError } = useContractRead({
    address: contractAddress,
    abi: parsedAbi,
    functionName,
    args: parsedArgs,
    enabled: !!contractAddress && !!functionName && parsedAbi.length > 0,
  })
  
  // Contract write operation
  const { config: writeConfig, error: prepareError } = usePrepareContractWrite({
    address: contractAddress,
    abi: parsedAbi,
    functionName,
    args: parsedArgs,
    enabled: !!contractAddress && !!functionName && parsedAbi.length > 0,
  })
  
  const { 
    data: writeData, 
    write: writeFunction, 
    isLoading: isWriteLoading,
    error: writeError
  } = useContractWrite(writeConfig)
  
  const { isLoading: isWritePending, isSuccess: isWriteSuccess } = useWaitForTransaction({
    hash: writeData?.hash,
  })
  
  // Handle read function
  const handleRead = () => {
    setError(null)
    
    if (!contractAddress) {
      setError("Contract address is required")
      return
    }
    
    if (!functionName) {
      setError("Function name is required")
      return
    }
    
    try {
      // Validate ABI format
      if (customAbi && !Array.isArray(JSON.parse(customAbi))) {
        setError("Invalid ABI format: must be a JSON array")
        return
      }
      
      if (parsedAbi.length === 0) {
        setError("Valid ABI is required")
        return
      }
      
      // Result will be available via the useContractRead hook
      if (readData !== undefined) {
        setReadResult(readData)
      }
    } catch (error: any) {
      setError(`ABI parsing error: ${error.message || "Invalid JSON format"}`)
    }
  }
  
  // Handle write function
  const handleWrite = () => {
    setError(null)
    
    if (!contractAddress) {
      setError("Contract address is required")
      return
    }
    
    if (!functionName) {
      setError("Function name is required")
      return
    }
    
    try {
      // Validate ABI format
      if (customAbi && !Array.isArray(JSON.parse(customAbi))) {
        setError("Invalid ABI format: must be a JSON array")
        return
      }
      
      if (parsedAbi.length === 0) {
        setError("Valid ABI is required")
        return
      }
      
      // Check if the function exists in the ABI
      const functionExists = parsedAbi.some(item => 
        item.name === functionName && item.type === "function"
      )
      
      if (!functionExists) {
        setError(`Function "${functionName}" not found in the provided ABI`)
        return
      }
      
      writeFunction?.()
    } catch (error: any) {
      setError(`ABI parsing error: ${error.message || "Invalid JSON format"}`)
    }
  }
  
  // Format result for display
  const formatResult = (result: any) => {
    if (result === null || result === undefined) return "No result"
    
    if (typeof result === "object") {
      try {
        return JSON.stringify(result, null, 2)
      } catch (e) {
        return "Complex object"
      }
    }
    
    return result.toString()
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Contract Interaction</CardTitle>
        <CardDescription>Interact with smart contracts on the blockchain</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="setup">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup">Setup</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
            <TabsTrigger value="write">Write</TabsTrigger>
          </TabsList>
          
          <TabsContent value="setup" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="contract-address">Contract Address</Label>
              <Input
                id="contract-address"
                placeholder="0x..."
                value={contractAddress || ""}
                disabled={!!contractAddress}
              />
            </div>
            
            {!contractAbi && (
              <div className="space-y-2">
                <Label htmlFor="contract-abi">Contract ABI</Label>
                <Textarea
                  id="contract-abi"
                  placeholder="[{...}]"
                  value={customAbi}
                  onChange={(e) => setCustomAbi(e.target.value)}
                  className="min-h-[150px] font-mono text-xs"
                />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="read" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="read-function">Function Name</Label>
              <Input
                id="read-function"
                placeholder="e.g., balanceOf"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="read-args">Function Arguments (comma separated)</Label>
              <Input
                id="read-args"
                placeholder="e.g., 0x1234...,100"
                value={functionArgs}
                onChange={(e) => setFunctionArgs(e.target.value)}
              />
            </div>
            
            <Button onClick={handleRead} disabled={isReadLoading}>
              {isReadLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Read Contract
            </Button>
            
            {readResult !== null && (
              <div className="mt-4 rounded-md border bg-muted p-4">
                <Label className="mb-2 block">Result:</Label>
                <pre className="overflow-auto whitespace-pre-wrap text-xs">
                  {formatResult(readResult)}
                </pre>
              </div>
            )}
            
            {(error || readError) && (
              <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3 text-red-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">{error || (readError instanceof Error ? readError.message : "Unknown error")}</span>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="write" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="write-function">Function Name</Label>
              <Input
                id="write-function"
                placeholder="e.g., transfer"
                value={functionName}
                onChange={(e) => setFunctionName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="write-args">Function Arguments (comma separated)</Label>
              <Input
                id="write-args"
                placeholder="e.g., 0x1234...,100"
                value={functionArgs}
                onChange={(e) => setFunctionArgs(e.target.value)}
              />
            </div>
            
            <Button 
              onClick={handleWrite} 
              disabled={isWriteLoading || isWritePending || !writeFunction}
            >
              {(isWriteLoading || isWritePending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isWriteSuccess ? "Transaction Successful!" : "Write to Contract"}
            </Button>
            
            {writeData && writeData.hash && (
              <div className="mt-4 rounded-md border bg-green-50 p-4 text-green-700">
                <p className="font-medium">Transaction submitted!</p>
                <p className="mt-1 break-all text-xs">
                  Transaction Hash: {writeData.hash}
                </p>
              </div>
            )}
            
            {(error || prepareError || writeError) && (
              <div className="flex items-center rounded-md border border-red-200 bg-red-50 p-3 text-red-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                <span className="text-sm">
                  {error || 
                   (prepareError instanceof Error ? prepareError.message : "") || 
                   (writeError instanceof Error ? writeError.message : "Unknown error")}
                </span>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
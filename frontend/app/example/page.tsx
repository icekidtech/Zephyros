"use client"

import { useState } from "react"
import { useContract } from "@/hooks/use-contract"
import { useTransaction } from "@/hooks/use-transaction"
import { TransactionStatus } from "@/components/blockchain/transaction-status"
import { BlockchainAddress } from "@/components/blockchain/blockchain-address"
import { GasEstimator } from "@/components/blockchain/gas-estimator"
import { WalletConnectButton } from "@/components/blockchain/wallet-connect-button"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle } from "lucide-react"

// Example ABI for demonstration purposes
const exampleABI = [
  {
    inputs: [],
    name: "getSupplyChainStatus",
    outputs: [{ internalType: "string", name: "", type: "string" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "string", name: "status", type: "string" }],
    name: "updateSupplyChainStatus",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
]

export default function ExamplePage() {
  // Replace with your actual contract address
  const contractAddress = "0x0000000000000000000000000000000000000000"
  const [walletConnected, setWalletConnected] = useState(false)
  const [useSimulation, setUseSimulation] = useState(false)

  const {
    contract,
    loading: contractLoading,
    error: contractError,
    address,
    network,
    reconnect,
    isSimulated,
  } = useContract(contractAddress, exampleABI)

  const { executeTransaction, status: txStatus, txHash, error: txError } = useTransaction()

  const [supplyChainStatus, setSupplyChainStatus] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  // Update simulation state when it changes in the hook
  useState(() => {
    setUseSimulation(isSimulated)
  })

  const handleConnect = (address: string) => {
    setWalletConnected(true)
    // Reconnect to the contract with the new wallet
    reconnect()
  }

  const handleDisconnect = () => {
    setWalletConnected(false)
  }

  const handleSimulationToggle = (simulate: boolean) => {
    setUseSimulation(simulate)
    // Reconnect with new simulation setting
    reconnect()
  }

  const getStatus = async () => {
    if (!contract) return

    try {
      setStatusLoading(true)
      const status = await contract.getSupplyChainStatus()
      setSupplyChainStatus(status)
    } catch (err) {
      console.error("Error getting status:", err)
    } finally {
      setStatusLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!contract) return

    try {
      // Example of using the executeTransaction hook
      await executeTransaction(
        contract.updateSupplyChainStatus.bind(contract),
        "Product verified at manufacturing facility",
      )

      // Refresh the status after successful update
      await getStatus()
    } catch (err) {
      console.error("Error updating status:", err)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-6 text-3xl font-bold">Supply Chain Contract Example</h1>

      {isSimulated && (
        <div className="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Simulation Mode Active</h3>
              <p className="text-sm">
                This demo is running in simulation mode. No real blockchain transactions will be made.
                {typeof window !== "undefined" && window.ethereum
                  ? " You can switch to real mode using the button above."
                  : " Install MetaMask to use real blockchain interactions."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <WalletConnectButton
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
          isSimulated={isSimulated}
          onSimulationToggle={handleSimulationToggle}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contract Connection</CardTitle>
            <CardDescription>Status of your connection to the blockchain contract</CardDescription>
          </CardHeader>
          <CardContent>
            {!walletConnected && !isSimulated ? (
              <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Wallet Not Connected</p>
                </div>
                <p className="mt-2 text-sm">Please connect your wallet to interact with the contract.</p>
              </div>
            ) : contractLoading ? (
              <p>Connecting to contract...</p>
            ) : contractError && !isSimulated ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <p className="font-medium">Connection Error</p>
                </div>
                <p className="mt-2 text-sm">{contractError.message}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Contract Status</p>
                  <div className="flex items-center gap-2">
                    <p className="text-green-600">Connected</p>
                    {isSimulated && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">Simulated</span>
                    )}
                  </div>
                </div>

                {address && <BlockchainAddress address={address} label="Your Address" />}

                {network && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Network</p>
                    <div className="flex items-center gap-2">
                      <p>{network}</p>
                      {isSimulated && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800">
                          Simulated
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <GasEstimator isSimulated={isSimulated} />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={getStatus} disabled={!contract || statusLoading || (!walletConnected && !isSimulated)}>
              {statusLoading ? "Loading..." : "Get Supply Chain Status"}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Chain Status</CardTitle>
            <CardDescription>View and update the current status of the supply chain</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supplyChainStatus ? (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">Current Status</p>
                  <p className="mt-1">{supplyChainStatus}</p>
                  {isSimulated && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      This is simulated data for demonstration purposes.
                    </p>
                  )}
                </div>
              ) : (
                <p>No status retrieved yet. Click "Get Supply Chain Status" to fetch.</p>
              )}

              <TransactionStatus status={txStatus} txHash={txHash} errorMessage={txError?.message} />
            </div>
          </CardContent>
          <CardFooter>
            <Button
              onClick={updateStatus}
              disabled={!contract || txStatus === "pending" || (!walletConnected && !isSimulated)}
              variant="outline"
            >
              {txStatus === "pending" ? "Processing..." : "Update Status"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

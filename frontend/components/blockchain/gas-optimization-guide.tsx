"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { useNetwork } from "wagmi"

export function GasOptimizationGuide() {
  const { chain } = useNetwork()
  const isEthereum = chain?.id === 1
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Gas Optimization Guide</CardTitle>
        <CardDescription>Tips to reduce transaction costs on Ethereum</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="timing">
            <AccordionTrigger>Timing Your Transactions</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Off-peak hours:</strong> Gas prices are typically lower during weekends and between 
                  UTC 0-4 (midnight to early morning in Europe).
                </li>
                <li>
                  <strong>Gas tracker:</strong> Use services like <a href="https://etherscan.io/gastracker" 
                  target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Etherscan Gas Tracker</a> to monitor current gas prices.
                </li>
                <li>
                  <strong>Gas price alerts:</strong> Set up alerts for when gas prices drop below a certain threshold.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="layer2">
            <AccordionTrigger>Layer 2 Solutions</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Optimistic Rollups:</strong> Solutions like Optimism and Arbitrum offer significantly 
                  lower gas fees (up to 10x cheaper) while inheriting Ethereum's security.
                </li>
                <li>
                  <strong>ZK Rollups:</strong> zkSync and StarkNet provide fast finality and lower fees through 
                  zero-knowledge proofs.
                </li>
                <li>
                  <strong>Sidechains:</strong> Polygon offers very low transaction costs with its own security model.
                </li>
                <li>
                  <strong>Bridges:</strong> Use official bridges to move assets between Ethereum and Layer 2 networks.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="batching">
            <AccordionTrigger>Transaction Batching</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Multicall:</strong> Combine multiple read operations into a single call.
                </li>
                <li>
                  <strong>Batch transfers:</strong> Use contracts like <code>ERC20Batcher</code> to send tokens to 
                  multiple recipients in one transaction.
                </li>
                <li>
                  <strong>Approval optimization:</strong> Use <code>increaseAllowance</code> instead of setting 
                  allowance to zero and then to a new value (saves one transaction).
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="contract">
            <AccordionTrigger>Smart Contract Optimization</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Gas-efficient tokens:</strong> Some tokens (like USDC) are more gas-efficient than others 
                  due to their implementation.
                </li>
                <li>
                  <strong>Permit functions:</strong> Use EIP-2612 permit functions to approve and transfer in a 
                  single transaction.
                </li>
                <li>
                  <strong>Flash loans/swaps:</strong> For large trades, flash swaps can be more gas-efficient than 
                  direct swaps.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="settings">
            <AccordionTrigger>Gas Settings Optimization</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc pl-6 space-y-2 text-sm">
                <li>
                  <strong>Priority fee:</strong> Set a lower priority fee for non-urgent transactions.
                </li>
                <li>
                  <strong>Gas limit:</strong> Avoid setting unnecessarily high gas limits. Our estimator adds a 10% 
                  buffer which is usually sufficient.
                </li>
                <li>
                  <strong>EIP-1559:</strong> Use EIP-1559 transactions which can save gas when network activity decreases 
                  after you submit your transaction.
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          
          {isEthereum && (
            <AccordionItem value="current">
              <AccordionTrigger>Current Network Status</AccordionTrigger>
              <AccordionContent>
                <div className="text-sm">
                  <p>You're currently on Ethereum Mainnet, which typically has higher gas fees.</p>
                  <p className="mt-2">Consider using one of these alternatives:</p>
                  <ul className="list-disc pl-6 space-y-1 mt-2">
                    <li>Arbitrum: ~90% gas savings</li>
                    <li>Optimism: ~90% gas savings</li>
                    <li>Polygon: ~99% gas savings</li>
                    <li>Base: ~90% gas savings</li>
                  </ul>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  )
}
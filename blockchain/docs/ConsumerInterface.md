# ConsumerInterface Smart Contract

## Overview
ConsumerInterface is a consumer-facing component of the Zephyros decentralized supply chain verification system built on the Avalanche blockchain's C-Chain. It provides a unified, read-only interface for end users to query product details and milestone histories, aggregating data from the ProductRegistry and SupplyChainTracker contracts.

## Contract Purpose
The contract serves as a consumer-friendly access point for verifying product authenticity and tracking a product's journey through the supply chain. By separating consumer queries into a dedicated contract, Zephyros maintains a clean separation of concerns in the architecture while ensuring efficient data retrieval for end users.

## Key Features
- Read-only access to product details from ProductRegistry
- Read-only access to milestone histories from SupplyChainTracker
- Gas-efficient data retrieval without redundant storage
- Subnet-compatible design with no chain-specific dependencies
- Simple, consumer-friendly interface for end-user applications

## Contract Details

### State Variables
- `IProductRegistry public immutable productRegistry` - Reference to the ProductRegistry contract
- `ISupplyChainTracker public immutable supplyChainTracker` - Reference to the SupplyChainTracker contract

### Constructor
```solidity
constructor(address _productRegistryAddress, address _supplyChainTrackerAddress)
# ProductRegistry Smart Contract

## Overview
ProductRegistry is the core contract of the Zephyros decentralized supply chain verification system built on the Avalanche blockchain's C-Chain. It provides functionality to register products with unique identifiers and store their metadata, enabling transparency and traceability across supply chains.

## Contract Purpose
The contract enables authorized manufacturers or the contract owner to register products on the blockchain, creating an immutable record of product provenance that can later be verified and tracked throughout the supply chain.

## Key Features
- Registration of products with unique identifiers
- Storage of product metadata including name, manufacturer, and timestamp
- Owner-based access control for product registration
- Gas-efficient custom error handling
- Subnet-compatible design with no chain-specific dependencies

## Contract Details

### State Variables
- `mapping(bytes32 => Product) private products` - Maps productIds to Product structs
- `bytes32[] private productIds` - Array of all registered product IDs

### Structs
**Product**
- `bytes32 productId` - Unique identifier for the product
- `string name` - Product name
- `address manufacturer` - Address of the product manufacturer
- `uint256 createdAt` - Unix timestamp when the product was registered

### Events
**ProductRegistered**
- `bytes32 indexed productId` - Product ID that was registered
- `address indexed manufacturer` - Address of the manufacturer who registered the product

### Functions

#### registerProduct
```solidity
function registerProduct(bytes32 productId, string calldata name, address manufacturer) external onlyOwner
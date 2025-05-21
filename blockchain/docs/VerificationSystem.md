# VerificationSystem Smart Contract

## Overview
VerificationSystem is a key component of the Zephyros decentralized supply chain verification system built on the Avalanche blockchain's C-Chain. It provides functionality to verify supply chain participants, assign roles (like Manufacturer or Supplier), and enable role-based access control for other contracts in the ecosystem.

## Contract Purpose
The contract allows designated administrators to verify participants in the supply chain, assigning them appropriate roles that determine their permissions within the system. This creates a trusted network of verified entities that can interact with other components of the Zephyros platform, enhancing security and accountability throughout the supply chain.

## Key Features
- Role-based access control using OpenZeppelin's AccessControl
- Participant verification with role assignment
- Revocation of verification when needed
- Comprehensive status queries for participants
- Gas-efficient custom error handling
- Subnet-compatible design with no chain-specific dependencies

## Contract Details

### Role Constants
- `ADMIN_ROLE`: Granted to administrators who can verify participants (`keccak256("ADMIN_ROLE")`)
- `MANUFACTURER_ROLE`: Assigned to verified manufacturers (`keccak256("MANUFACTURER_ROLE")`)
- `SUPPLIER_ROLE`: Assigned to verified suppliers (`keccak256("SUPPLIER_ROLE")`)

### State Variables
- `mapping(address => Participant) private participants` - Maps participant addresses to their verification data

### Structs
**Participant**
- `bytes32 role` - The role assigned to the participant (MANUFACTURER_ROLE or SUPPLIER_ROLE)
- `bool isVerified` - Whether the participant is currently verified
- `uint256 verifiedAt` - Unix timestamp when the participant was verified

### Events
**ParticipantVerified**
- `address indexed participant` - Address of the participant that was verified
- `bytes32 indexed role` - Role assigned to the participant

**VerificationRevoked**
- `address indexed participant` - Address of the participant whose verification was revoked

### Constructor
```solidity
constructor()
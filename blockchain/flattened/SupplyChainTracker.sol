// SPDX-License-Identifier: MIT
// Sources flattened with hardhat v2.24.0 https://hardhat.org


// File contracts/SupplyChainTracker.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IProductRegistry
 * @dev Interface for ProductRegistry contract
 */
interface IProductRegistry {
    function getProductDetails(bytes32 productId) external view returns (bytes32, string memory, address, uint256);
    function productExists(bytes32 productId) external view returns (bool);
}

/**
 * @title IVerificationSystem
 * @dev Interface for VerificationSystem contract
 */
interface IVerificationSystem {
    function isVerifiedForRole(address participant, bytes32 role) external view returns (bool);
}

/**
 * @title SupplyChainTracker
 * @dev A contract for tracking supply chain milestones for products registered in ProductRegistry
 * @custom:dev-run-script ./scripts/deploy_supply_chain_tracker.ts
 */
contract SupplyChainTracker {
    // Custom errors for gas-efficient reverts
    error ProductNotFound(bytes32 productId);
    error InvalidTimestamp(uint256 timestamp);
    error EmptyMilestoneType();
    error EmptyMilestoneDetails();
    error NotVerifiedSupplier(address caller);
    
    // Role definition - must match the one in VerificationSystem
    bytes32 public constant SUPPLIER_ROLE = keccak256("SUPPLIER_ROLE");
    
    // Milestone struct to store milestone details
    struct Milestone {
        string milestoneType;
        string details;
        uint256 timestamp;
        address participant;
    }

    // Contract references
    IProductRegistry public immutable productRegistry;
    IVerificationSystem public immutable verificationSystem;
    
    // Nested mapping from productId to array of Milestone structs
    mapping(bytes32 => Milestone[]) private productMilestones;
    
    // Event emitted when a new milestone is added
    event MilestoneAdded(
        bytes32 indexed productId,
        uint256 indexed milestoneIndex,
        address indexed participant
    );

    /**
     * @dev Constructor sets the ProductRegistry and VerificationSystem contract addresses
     * @param _productRegistryAddress Address of the deployed ProductRegistry contract
     * @param _verificationSystemAddress Address of the deployed VerificationSystem contract
     */
    constructor(address _productRegistryAddress, address _verificationSystemAddress) {
        require(_productRegistryAddress != address(0), "Invalid ProductRegistry address");
        require(_verificationSystemAddress != address(0), "Invalid VerificationSystem address");
        productRegistry = IProductRegistry(_productRegistryAddress);
        verificationSystem = IVerificationSystem(_verificationSystemAddress);
    }

    /**
     * @dev Adds a new milestone for a product
     * @param productId The product's unique identifier (must exist in ProductRegistry)
     * @param milestoneType The type of milestone (e.g., "Manufactured", "Shipped", "Delivered")
     * @param details Additional details about the milestone
     * @param timestamp Unix timestamp when the milestone occurred
     */
    function addMilestone(
        bytes32 productId,
        string calldata milestoneType,
        string calldata details,
        uint256 timestamp
    ) external {
        // Check that sender is a verified supplier
        if (!verificationSystem.isVerifiedForRole(msg.sender, SUPPLIER_ROLE)) {
            revert NotVerifiedSupplier(msg.sender);
        }
        
        // Verify product exists in ProductRegistry
        try productRegistry.getProductDetails(productId) returns (bytes32, string memory, address, uint256) {
            // Product exists, continue with validation
        } catch {
            revert ProductNotFound(productId);
        }
        
        // Validate timestamp is not in the future
        if (timestamp > block.timestamp) {
            revert InvalidTimestamp(timestamp);
        }
        
        // Validate milestone data
        if (bytes(milestoneType).length == 0) {
            revert EmptyMilestoneType();
        }
        
        if (bytes(details).length == 0) {
            revert EmptyMilestoneDetails();
        }
        
        // Create new milestone
        Milestone memory newMilestone = Milestone({
            milestoneType: milestoneType,
            details: details,
            timestamp: timestamp,
            participant: msg.sender
        });
        
        // Add milestone to product's array
        productMilestones[productId].push(newMilestone);
        
        // Get milestone index (array length - 1)
        uint256 milestoneIndex = productMilestones[productId].length - 1;
        
        // Emit event
        emit MilestoneAdded(productId, milestoneIndex, msg.sender);
    }

    /**
     * @dev Retrieves all milestones for a specific product
     * @param productId The product's unique identifier
     * @return An array of Milestone structs
     */
    function getProductMilestones(bytes32 productId) external view returns (Milestone[] memory) {
        // Verify product exists in ProductRegistry
        try productRegistry.getProductDetails(productId) returns (bytes32, string memory, address, uint256) {
            // Product exists, return milestones
            return productMilestones[productId];
        } catch {
            revert ProductNotFound(productId);
        }
    }

    /**
     * @dev Gets the count of milestones for a specific product
     * @param productId The product's unique identifier
     * @return The number of milestones for the product
     */
    function getMilestoneCount(bytes32 productId) external view returns (uint256) {
        // We don't verify product exists here to save gas,
        // just return the array length which will be 0 for non-existent products
        return productMilestones[productId].length;
    }

    /**
     * @dev Gets a specific milestone for a product by index
     * @param productId The product's unique identifier
     * @param index The milestone index to retrieve
     * @return milestoneType The type of milestone
     * @return details Additional information about the milestone
     * @return timestamp Unix timestamp when the milestone occurred
     * @return participant Address of the participant who added the milestone
     */
    function getMilestoneAtIndex(bytes32 productId, uint256 index) external view returns (
        string memory milestoneType,
        string memory details,
        uint256 timestamp,
        address participant
    ) {
        // Verify milestone index exists
        require(index < productMilestones[productId].length, "Milestone index out of bounds");
        
        // Get milestone from storage
        Milestone storage milestone = productMilestones[productId][index];
        
        return (
            milestone.milestoneType,
            milestone.details,
            milestone.timestamp,
            milestone.participant
        );
    }
}

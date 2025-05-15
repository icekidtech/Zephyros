// SPDX-License-Identifier: MIT
// Sources flattened with hardhat v2.24.0 https://hardhat.org


// File contracts/ConsumerInterface.sol

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
 * @title ISupplyChainTracker
 * @dev Interface for SupplyChainTracker contract
 */
interface ISupplyChainTracker {
    struct Milestone {
        string milestoneType;
        string details;
        uint256 timestamp;
        address participant;
    }
    
    function getProductMilestones(bytes32 productId) external view returns (Milestone[] memory);
}

/**
 * @title ConsumerInterface
 * @dev A contract for consumers to query product details and milestone histories
 * @custom:dev-run-script ./scripts/deploy_consumer_interface.ts
 */
contract ConsumerInterface {
    // Custom errors
    error InvalidContractAddress();
    
    // Reference to other contracts
    IProductRegistry public immutable productRegistry;
    ISupplyChainTracker public immutable supplyChainTracker;
    
    /**
     * @dev Constructor sets the address of ProductRegistry and SupplyChainTracker contracts
     * @param _productRegistryAddress Address of the deployed ProductRegistry contract
     * @param _supplyChainTrackerAddress Address of the deployed SupplyChainTracker contract
     */
    constructor(address _productRegistryAddress, address _supplyChainTrackerAddress) {
        if (_productRegistryAddress == address(0) || _supplyChainTrackerAddress == address(0)) {
            revert InvalidContractAddress();
        }
        productRegistry = IProductRegistry(_productRegistryAddress);
        supplyChainTracker = ISupplyChainTracker(_supplyChainTrackerAddress);
    }
    
    /**
     * @dev Gets details of a product
     * @param productId The product's unique identifier
     * @return productId The product's ID
     * @return name The product's name
     * @return manufacturer The manufacturer's address
     * @return createdAt When the product was created
     */
    function getProductDetails(bytes32 productId) external view returns (
        bytes32,
        string memory,
        address,
        uint256
    ) {
        return productRegistry.getProductDetails(productId);
    }
    
    /**
     * @dev Gets the milestone history of a product
     * @param productId The product's unique identifier
     * @return An array of Milestone structs
     */
    function getProductMilestones(bytes32 productId) external view returns (ISupplyChainTracker.Milestone[] memory) {
        return supplyChainTracker.getProductMilestones(productId);
    }
    
    /**
     * @dev Check if a product exists
     * @param productId The product's unique identifier
     * @return Whether the product exists
     */
    function productExists(bytes32 productId) external view returns (bool) {
        return productRegistry.productExists(productId);
    }
}

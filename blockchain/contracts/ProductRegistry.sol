// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ProductRegistry
 * @dev A contract for registering products in the Zephyros supply chain verification system
 * @custom:dev-run-script ./scripts/deploy_product_registry.ts
 */
contract ProductRegistry is Ownable {
    // Custom errors for gas-efficient reverts
    error ProductAlreadyExists(bytes32 productId);
    error InvalidManufacturer(address manufacturer);
    error EmptyProductName();
    error ProductNotFound(bytes32 productId);

    // Product struct to store product details
    struct Product {
        bytes32 productId;
        string name;
        address manufacturer;
        uint256 createdAt;
    }

    // Mapping from productId to Product struct
    mapping(bytes32 => Product) private products;
    
    // Array to track all productIds
    bytes32[] private productIds;

    // Event emitted when a new product is registered
    event ProductRegistered(bytes32 indexed productId, address indexed manufacturer);

    /**
     * @dev Registers a new product in the registry
     * @param productId The unique identifier for the product
     * @param name The product name
     * @param manufacturer The address of the product manufacturer
     */
    function registerProduct(
        bytes32 productId,
        string calldata name,
        address manufacturer
    ) external onlyOwner {
        // Validate inputs
        if (products[productId].createdAt != 0) {
            revert ProductAlreadyExists(productId);
        }
        if (manufacturer == address(0)) {
            revert InvalidManufacturer(manufacturer);
        }
        if (bytes(name).length == 0) {
            revert EmptyProductName();
        }

        // Create and store the product
        products[productId] = Product({
            productId: productId,
            name: name,
            manufacturer: manufacturer,
            createdAt: block.timestamp
        });
        
        // Add to the productIds array
        productIds.push(productId);

        // Emit event
        emit ProductRegistered(productId, manufacturer);
    }

    /**
     * @dev Retrieves details of a specific product
     * @param productId The unique identifier of the product to retrieve
     * @return Product details (productId, name, manufacturer, createdAt)
     */
    function getProductDetails(bytes32 productId) 
        external 
        view 
        returns (bytes32, string memory, address, uint256) 
    {
        Product storage product = products[productId];
        
        // Check if product exists
        if (product.createdAt == 0) {
            revert ProductNotFound(productId);
        }
        
        return (
            product.productId,
            product.name,
            product.manufacturer,
            product.createdAt
        );
    }
    
    /**
     * @dev Checks if a product exists
     * @param productId The unique identifier to check
     * @return bool Whether the product exists
     */
    function productExists(bytes32 productId) external view returns (bool) {
        return products[productId].createdAt != 0;
    }
    
    /**
     * @dev Gets the total number of registered products
     * @return uint256 The count of products
     */
    function getProductCount() external view returns (uint256) {
        return productIds.length;
    }
    
    /**
     * @dev Gets a product ID at a specific index
     * @param index The index to query
     * @return bytes32 The product ID at the specified index
     */
    function getProductIdAtIndex(uint256 index) external view returns (bytes32) {
        require(index < productIds.length, "Index out of bounds");
        return productIds[index];
    }
}
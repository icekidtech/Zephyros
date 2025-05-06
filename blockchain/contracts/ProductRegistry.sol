// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVerificationSystem
 * @dev Interface for VerificationSystem contract
 */
interface IVerificationSystem {
    function getParticipantStatus(address participant) external view returns (bytes32 role, bool isVerified, uint256 verifiedAt);
    function isVerifiedForRole(address participant, bytes32 role) external view returns (bool);
}

/**
 * @title ProductRegistry
 * @dev A contract for registering products in the Zephyros supply chain verification system
 * @custom:dev-run-script ./scripts/deploy_product_registry.ts
 */
contract ProductRegistry {
    // Role constant - must match VerificationSystem's definition
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    
    // Custom errors for gas-efficient reverts
    error ProductAlreadyExists(bytes32 productId);
    error InvalidManufacturer(address manufacturer);
    error EmptyProductName();
    error ProductNotFound(bytes32 productId);
    error NotVerifiedManufacturer(address sender);

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
    
    // Reference to VerificationSystem contract
    IVerificationSystem public immutable verificationSystem;
    
    // Event emitted when a new product is registered
    event ProductRegistered(bytes32 indexed productId, address indexed manufacturer);

    /**
     * @dev Constructor sets the address of the VerificationSystem contract
     * @param _verificationSystemAddress Address of the deployed VerificationSystem contract
     */
    constructor(address _verificationSystemAddress) {
        require(_verificationSystemAddress != address(0), "Invalid VerificationSystem address");
        verificationSystem = IVerificationSystem(_verificationSystemAddress);
    }

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
    ) external {
        // Check that sender is a verified manufacturer
        if (!verificationSystem.isVerifiedForRole(msg.sender, MANUFACTURER_ROLE)) {
            revert NotVerifiedManufacturer(msg.sender);
        }
        
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
     * @return productId The product's ID
     * @return name The product's name
     * @return manufacturer The manufacturer's address
     * @return createdAt When the product was created
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
// SPDX-License-Identifier: MIT
// Sources flattened with hardhat v2.24.0 https://hardhat.org


// File contracts/ProductRegistry.sol

// Original license: SPDX_License_Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IVerificationSystem
 * @dev Interface for VerificationSystem contract
 */
interface IVerificationSystem {
    function isVerifiedForRole(address participant, bytes32 role) external view returns (bool);
}

/**
 * @title ProductRegistry
 * @dev A contract for registering and tracking products
 * @custom:dev-run-script ./scripts/deploy_product_registry.ts
 */
contract ProductRegistry {
    // Custom errors for gas-efficient reverts
    error ProductAlreadyExists(bytes32 productId);
    error ProductNotFound(bytes32 productId);
    error NotVerifiedManufacturer(address caller);
    
    // Role definition - must match the one in VerificationSystem
    bytes32 public constant MANUFACTURER_ROLE = keccak256("MANUFACTURER_ROLE");
    
    // VerificationSystem contract reference
    IVerificationSystem public immutable verificationSystem;
    
    // Product struct to store product details
    struct Product {
        bytes32 productId;
        string name;
        address manufacturer;
        uint256 createdAt;
    }
    
    // Mapping from productId to Product struct
    mapping(bytes32 => Product) private products;
    
    // Event emitted when a new product is registered
    event ProductRegistered(bytes32 indexed productId, address indexed manufacturer);
    
    /**
     * @dev Constructor sets the address of VerificationSystem contract
     * @param _verificationSystemAddress Address of the deployed VerificationSystem contract
     */
    constructor(address _verificationSystemAddress) {
        require(_verificationSystemAddress != address(0), "Invalid VerificationSystem address");
        verificationSystem = IVerificationSystem(_verificationSystemAddress);
    }
    
    /**
     * @dev Registers a new product
     * @param productId The unique identifier for the product
     * @param name The name of the product
     * @param manufacturer The address of the manufacturer
     */
    function registerProduct(bytes32 productId, string calldata name, address manufacturer) external {
        // Verify caller is a verified manufacturer
        if (!verificationSystem.isVerifiedForRole(msg.sender, MANUFACTURER_ROLE)) {
            revert NotVerifiedManufacturer(msg.sender);
        }
        
        // Check if product already exists
        if (productExists(productId)) {
            revert ProductAlreadyExists(productId);
        }
        
        // Check manufacturer address is not zero
        require(manufacturer != address(0), "Invalid manufacturer address");
        
        // Create product
        products[productId] = Product({
            productId: productId,
            name: name,
            manufacturer: manufacturer,
            createdAt: block.timestamp
        });
        
        // Emit event
        emit ProductRegistered(productId, manufacturer);
    }
    
    /**
     * @dev Gets details of a product
     * @param productId The unique identifier for the product
     * @return The product's ID
     * @return The product's name
     * @return The manufacturer's address
     * @return The timestamp when the product was created
     */
    function getProductDetails(bytes32 productId) external view returns (bytes32, string memory, address, uint256) {
        Product memory product = products[productId];
        
        // Check if product exists
        if (product.createdAt == 0) {
            revert ProductNotFound(productId);
        }
        
        return (product.productId, product.name, product.manufacturer, product.createdAt);
    }
    
    /**
     * @dev Check if a product exists
     * @param productId The unique identifier for the product
     * @return Whether the product exists
     */
    function productExists(bytes32 productId) public view returns (bool) {
        return products[productId].createdAt > 0;
    }
}

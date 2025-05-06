import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("ProductRegistry", function () {
  let productRegistry: ProductRegistry;
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let manufacturerAddress: SignerWithAddress;
  let productId: string;

  beforeEach(async function () {
    // Get signers
    [owner, nonOwner, manufacturerAddress] = await ethers.getSigners();
    
    // Deploy the contract
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(owner).deploy();
    
    // Create a unique product ID using keccak256
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
  });

  describe("Product Registration", function () {
    it("Should allow the owner to register a new product", async function () {
      const productName = "Test Product";
      
      // Register product
      const tx = await productRegistry.registerProduct(
        productId,
        productName,
        manufacturerAddress.address
      );
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(productRegistry, "ProductRegistered")
        .withArgs(productId, manufacturerAddress.address);
      
      // Verify the product was stored correctly
      const productDetails = await productRegistry.getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal(productName);
      expect(productDetails[2]).to.equal(manufacturerAddress.address);
      expect(productDetails[3]).to.be.gt(0); // Timestamp should be set
      
      // Verify product exists
      expect(await productRegistry.productExists(productId)).to.be.true;
      
      // Verify product count
      expect(await productRegistry.getProductCount()).to.equal(1);
    });
    
    it("Should revert if non-owner tries to register a product", async function () {
      await expect(
        productRegistry.connect(nonOwner).registerProduct(
          productId,
          "Test Product",
          manufacturerAddress.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "OwnableUnauthorizedAccount");
    });
    
    it("Should revert if product with same ID already exists", async function () {
      // Register product first time
      await productRegistry.registerProduct(
        productId,
        "Test Product",
        manufacturerAddress.address
      );
      
      // Try to register again with same ID
      await expect(
        productRegistry.registerProduct(
          productId,
          "Another Product",
          manufacturerAddress.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "ProductAlreadyExists");
    });
    
    it("Should revert if manufacturer address is zero", async function () {
      await expect(
        productRegistry.registerProduct(
          productId,
          "Test Product",
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(productRegistry, "InvalidManufacturer");
    });
    
    it("Should revert if product name is empty", async function () {
      await expect(
        productRegistry.registerProduct(
          productId,
          "",
          manufacturerAddress.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "EmptyProductName");
    });
  });
  
  describe("Product Queries", function () {
    beforeEach(async function () {
      // Register a product for testing queries
      await productRegistry.registerProduct(
        productId,
        "Test Product",
        manufacturerAddress.address
      );
    });
    
    it("Should return correct product details", async function () {
      const productDetails = await productRegistry.getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal("Test Product");
      expect(productDetails[2]).to.equal(manufacturerAddress.address);
    });
    
    it("Should revert when querying non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      await expect(
        productRegistry.getProductDetails(nonExistentId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
    
    it("Should correctly return product at index", async function () {
      // Get the product ID at index 0
      const storedProductId = await productRegistry.getProductIdAtIndex(0);
      expect(storedProductId).to.equal(productId);
      
      // Register another product
      const secondProductId = keccak256(toUtf8Bytes(`Product2-${Date.now()}`));
      await productRegistry.registerProduct(
        secondProductId,
        "Second Product",
        manufacturerAddress.address
      );
      
      // Check second product
      const secondStoredProductId = await productRegistry.getProductIdAtIndex(1);
      expect(secondStoredProductId).to.equal(secondProductId);
      
      // Verify count
      expect(await productRegistry.getProductCount()).to.equal(2);
    });
    
    it("Should revert when accessing out of bounds index", async function () {
      await expect(
        productRegistry.getProductIdAtIndex(99)
      ).to.be.revertedWith("Index out of bounds");
    });
  });
});
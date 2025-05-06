import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("ProductRegistry with VerificationSystem", function () {
  let productRegistry: ProductRegistry;
  let verificationSystem: VerificationSystem;
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let nonManufacturer: SignerWithAddress;
  let productId: string;
  let MANUFACTURER_ROLE: string;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, nonManufacturer] = await ethers.getSigners();
    
    // Deploy VerificationSystem first
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get the MANUFACTURER_ROLE
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    
    // Deploy ProductRegistry with VerificationSystem address
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    // Verify the manufacturer
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    
    // Create a unique product ID using keccak256
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
  });

  describe("Deployment", function() {
    it("Should store the correct VerificationSystem address", async function() {
      expect(await productRegistry.verificationSystem()).to.equal(await verificationSystem.getAddress());
    });

    it("Should have the correct MANUFACTURER_ROLE value", async function() {
      const contractRole = await productRegistry.MANUFACTURER_ROLE();
      expect(contractRole).to.equal(MANUFACTURER_ROLE);
    });
  });

  describe("Product Registration", function () {
    it("Should allow a verified manufacturer to register a product", async function () {
      const productName = "Test Product";
      
      // Register product as verified manufacturer
      const tx = await productRegistry.connect(manufacturer).registerProduct(
        productId,
        productName,
        manufacturer.address
      );
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(productRegistry, "ProductRegistered")
        .withArgs(productId, manufacturer.address);
      
      // Verify the product was stored correctly
      const productDetails = await productRegistry.getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal(productName);
      expect(productDetails[2]).to.equal(manufacturer.address);
      expect(productDetails[3]).to.be.gt(0);
      
      // Verify product exists
      expect(await productRegistry.productExists(productId)).to.be.true;
      
      // Verify product count
      expect(await productRegistry.getProductCount()).to.equal(1);
    });
    
    it("Should revert if non-verified manufacturer tries to register a product", async function () {
      await expect(
        productRegistry.connect(nonManufacturer).registerProduct(
          productId,
          "Test Product",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
    });
    
    it("Should revert if product with same ID already exists", async function () {
      // Register product first time
      await productRegistry.connect(manufacturer).registerProduct(
        productId,
        "Test Product",
        manufacturer.address
      );
      
      // Try to register again with same ID
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          "Another Product",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "ProductAlreadyExists");
    });
    
    it("Should revert if manufacturer address is zero", async function () {
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          "Test Product",
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(productRegistry, "InvalidManufacturer");
    });
    
    it("Should revert if product name is empty", async function () {
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          "",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "EmptyProductName");
    });

    it("Should revert if manufacturer's verification is revoked", async function() {
      // Revoke verification for the manufacturer
      await verificationSystem.connect(admin).revokeVerification(manufacturer.address);

      // Try to register a product after revocation
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          "Test Product",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
    });
  });
  
  describe("Product Queries", function () {
    beforeEach(async function () {
      // Register a product for testing queries
      await productRegistry.connect(manufacturer).registerProduct(
        productId,
        "Test Product",
        manufacturer.address
      );
    });
    
    it("Should return correct product details", async function () {
      const productDetails = await productRegistry.getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal("Test Product");
      expect(productDetails[2]).to.equal(manufacturer.address);
    });
    
    it("Should revert when querying non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      await expect(
        productRegistry.getProductDetails(nonExistentId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
    
    it("Should correctly return product count", async function () {
      expect(await productRegistry.getProductCount()).to.equal(1);
      
      // Register another product
      const secondProductId = keccak256(toUtf8Bytes(`Product2-${Date.now()}`));
      await productRegistry.connect(manufacturer).registerProduct(
        secondProductId,
        "Second Product",
        manufacturer.address
      );
      
      expect(await productRegistry.getProductCount()).to.equal(2);
    });
    
    it("Should correctly return product at index", async function () {
      // Get the product ID at index 0
      const storedProductId = await productRegistry.getProductIdAtIndex(0);
      expect(storedProductId).to.equal(productId);
      
      // Register another product
      const secondProductId = keccak256(toUtf8Bytes(`Product2-${Date.now()}`));
      await productRegistry.connect(manufacturer).registerProduct(
        secondProductId,
        "Second Product",
        manufacturer.address
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
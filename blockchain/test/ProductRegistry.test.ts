import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("ProductRegistry", function () {
  let productRegistry: ProductRegistry;
  let verificationSystem: VerificationSystem;
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let nonManufacturer: SignerWithAddress;
  
  let MANUFACTURER_ROLE: string;
  let productId: string;
  let productName: string = "Test Product";

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, nonManufacturer] = await ethers.getSigners();
    
    // Deploy VerificationSystem
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get MANUFACTURER_ROLE constant
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    
    // Verify the manufacturer in VerificationSystem
    await verificationSystem.connect(admin).verifyParticipant(
      manufacturer.address, 
      MANUFACTURER_ROLE
    );
    
    // Deploy ProductRegistry with VerificationSystem address
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(
      await verificationSystem.getAddress()
    );
    
    // Create a unique product ID for testing
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
  });

  describe("Deployment", function () {
    it("Should set the VerificationSystem address", async function () {
      expect(await productRegistry.verificationSystem()).to.equal(
        await verificationSystem.getAddress()
      );
    });
    
    it("Should have the correct MANUFACTURER_ROLE value", async function () {
      const contractRole = await productRegistry.MANUFACTURER_ROLE();
      expect(contractRole).to.equal(MANUFACTURER_ROLE);
    });
  });

  describe("Product Registration", function () {
    it("Should allow verified manufacturer to register a product", async function () {
      // Register the product
      const tx = await productRegistry.connect(manufacturer).registerProduct(
        productId,
        productName,
        manufacturer.address
      );
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(productRegistry, "ProductRegistered")
        .withArgs(productId, manufacturer.address);
      
      // Check that the product exists
      expect(await productRegistry.productExists(productId)).to.be.true;
      
      // Check the product details
      const details = await productRegistry.getProductDetails(productId);
      expect(details[0]).to.equal(productId);
      expect(details[1]).to.equal(productName);
      expect(details[2]).to.equal(manufacturer.address);
      expect(details[3]).to.be.gt(0); // timestamp should be non-zero
    });

    it("Should revert when non-verified user tries to register a product", async function () {
      await expect(
        productRegistry.connect(nonManufacturer).registerProduct(
          productId,
          productName,
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
    });
    
    it("Should revert when registering with invalid manufacturer address", async function () {
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          productName,
          ethers.ZeroAddress
        )
      ).to.be.revertedWith("Invalid manufacturer address");
    });
    
    it("Should revert when registering a duplicate product ID", async function () {
      // Register the product first
      await productRegistry.connect(manufacturer).registerProduct(
        productId,
        productName,
        manufacturer.address
      );
      
      // Try to register it again
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          "Another Product Name",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "ProductAlreadyExists");
    });
    
    it("Should revert when manufacturer's verification is revoked", async function () {
      // Revoke verification from manufacturer
      await verificationSystem.connect(admin).revokeVerification(manufacturer.address);
      
      // Try to register a product
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          productId,
          productName,
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
        productName,
        manufacturer.address
      );
    });
    
    it("Should return correct details for a product", async function () {
      const details = await productRegistry.getProductDetails(productId);
      expect(details[0]).to.equal(productId);
      expect(details[1]).to.equal(productName);
      expect(details[2]).to.equal(manufacturer.address);
      expect(details[3]).to.be.gt(0); // timestamp should be non-zero
    });
    
    it("Should revert when querying non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        productRegistry.getProductDetails(nonExistentId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
    
    it("Should correctly check if a product exists", async function () {
      // Check existing product
      expect(await productRegistry.productExists(productId)).to.be.true;
      
      // Check non-existing product
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      expect(await productRegistry.productExists(nonExistentId)).to.be.false;
    });
    
    it("Should allow anyone to query product details", async function () {
      // Non-verified user should still be able to query products
      const details = await productRegistry.connect(nonManufacturer).getProductDetails(productId);
      expect(details[0]).to.equal(productId);
      expect(details[1]).to.equal(productName);
      expect(details[2]).to.equal(manufacturer.address);
    });
  });
});
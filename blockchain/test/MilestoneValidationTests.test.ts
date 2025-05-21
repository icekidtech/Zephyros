import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone Validation Tests", function () {
  // Contract instances
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  
  // Signers
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let consumer: SignerWithAddress;
  
  // Test data
  let productId: string;
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, supplier, consumer] = await ethers.getSigners();
    
    // Deploy contracts
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get role constants
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
    
    // Verify participants
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    // Generate a unique product ID and register product
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    await productRegistry.connect(manufacturer).registerProduct(
      productId,
      "Test Product for Validation",
      manufacturer.address
    );
  });

  describe("Input Validation", function() {
    it("Should reject milestone with future timestamp", async function() {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Future Milestone",
          "This milestone is in the future",
          futureTimestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "InvalidTimestamp");
    });
    
    it("Should reject milestone for non-existent product", async function() {
      const nonExistentProductId = keccak256(toUtf8Bytes("NonExistentProduct"));
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          nonExistentProductId,
          "Milestone",
          "This product doesn't exist",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
    
    it("Should reject milestone with empty milestone type", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "",
          "Empty milestone type",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneType");
    });
    
    it("Should reject milestone with empty details", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Valid Type",
          "",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneDetails");
    });
  });
  
  describe("Index Validation", function() {
    it("Should revert when retrieving milestone with invalid index", async function() {
      // Add a milestone first
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Milestone",
        "Test milestone",
        timestamp
      );
      
      // Try to access a non-existent index
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });
    
    it("Should revert when querying milestones for non-existent product", async function() {
      const nonExistentProductId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        supplyChainTracker.getProductMilestones(nonExistentProductId)
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
  });
});
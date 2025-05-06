import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone Role Tests", function () {
  // Contract instances
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  
  // Signers
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let nonSupplier: SignerWithAddress;
  
  // Test data
  let productId: string;
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, supplier, nonSupplier] = await ethers.getSigners();
    
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
      "Test Product for Role Testing",
      manufacturer.address
    );
  });

  describe("Role-Based Access Control", function() {
    it("Should block non-supplier from adding milestone", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(nonSupplier).addMilestone(
          productId,
          "Milestone",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should block manufacturer (wrong role) from adding milestone", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(manufacturer).addMilestone(
          productId,
          "Milestone",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should block milestone addition after supplier verification is revoked", async function() {
      // Add a milestone first
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured before revocation",
        timestamp
      );
      
      // Revoke supplier verification
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      // Try to add another milestone - should revert
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Shipped",
          "Product shipped after revocation",
          timestamp - 1800 // 30 minutes after manufacturing
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should allow milestone addition after re-verification", async function() {
      // Revoke supplier verification
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      // Try to add milestone - should revert
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Manufactured",
          "Product manufactured while revoked",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
      
      // Re-verify supplier
      await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
      
      // Now should be able to add milestone
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured after re-verification",
        timestamp
      );
      
      // Verify milestone was added
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
    });
    
    it("Should allow anyone to retrieve milestones", async function() {
      // Add a milestone first
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured",
        timestamp
      );
      
      // Non-supplier should be able to read milestones
      const milestones = await supplyChainTracker.connect(nonSupplier).getProductMilestones(productId);
      
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
    });
  });
});
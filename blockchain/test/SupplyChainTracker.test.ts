import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("SupplyChainTracker with VerificationSystem", function () {
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let nonSupplier: SignerWithAddress;
  let productId: string;
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, supplier, nonSupplier] = await ethers.getSigners();
    
    // Deploy VerificationSystem first
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get the roles
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
    
    // Deploy ProductRegistry with VerificationSystem address
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    // Deploy SupplyChainTracker with both addresses
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    // Verify participants
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    
    // Create a unique product ID
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    
    // Register a product in ProductRegistry
    await productRegistry.connect(manufacturer).registerProduct(
      productId,
      "Test Product",
      manufacturer.address
    );
  });

  describe("Deployment", function() {
    it("Should store the correct ProductRegistry address", async function() {
      expect(await supplyChainTracker.productRegistry()).to.equal(await productRegistry.getAddress());
    });

    it("Should store the correct VerificationSystem address", async function() {
      expect(await supplyChainTracker.verificationSystem()).to.equal(await verificationSystem.getAddress());
    });

    it("Should have the correct SUPPLIER_ROLE value", async function() {
      const contractRole = await supplyChainTracker.SUPPLIER_ROLE();
      expect(contractRole).to.equal(SUPPLIER_ROLE);
    });
  });

  describe("Milestone Addition", function () {
    it("Should allow verified supplier to add a milestone for an existing product", async function () {
      const milestoneType = "Shipped";
      const details = "Product shipped from Warehouse A to Store B";
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      // Add milestone as verified supplier
      const tx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        milestoneType,
        details,
        timestamp
      );
      
      // Check that event was emitted
      await expect(tx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 0, supplier.address);
      
      // Verify milestone count
      const milestoneCount = await supplyChainTracker.getMilestoneCount(productId);
      expect(milestoneCount).to.equal(1);
      
      // Verify milestone data
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 0);
      expect(milestone[0]).to.equal(milestoneType);
      expect(milestone[1]).to.equal(details);
      expect(milestone[2]).to.equal(timestamp);
      expect(milestone[3]).to.equal(supplier.address);
    });
    
    it("Should revert when non-verified supplier tries to add a milestone", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(nonSupplier).addMilestone(
          productId,
          "Shipped",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });

    it("Should revert when manufacturer (wrong role) tries to add a milestone", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(manufacturer).addMilestone(
          productId,
          "Shipped",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should revert when adding milestone for non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          nonExistentId,
          "Shipped",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
    
    it("Should revert when adding milestone with future timestamp", async function () {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Shipped",
          "Details",
          futureTimestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "InvalidTimestamp");
    });
    
    it("Should revert when milestone type is empty", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneType");
    });
    
    it("Should revert when milestone details are empty", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Shipped",
          "",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneDetails");
    });

    it("Should revert when supplier's verification is revoked", async function () {
      // Revoke supplier verification
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Shipped",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
  });
  
  describe("Milestone Retrieval", function () {
    beforeEach(async function () {
      // Add some milestones for testing retrieval
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured in Facility A",
        twoHoursAgo
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        oneHourAgo
      );
    });
    
    it("Should retrieve all milestones for a product", async function () {
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
      expect(milestones[0].details).to.equal("Product manufactured in Facility A");
      expect(milestones[1].milestoneType).to.equal("Packaged");
      expect(milestones[1].details).to.equal("Product packaged for shipping");
    });
    
    it("Should revert when retrieving milestones for non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        supplyChainTracker.getProductMilestones(nonExistentId)
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
    
    it("Should return correct milestone count", async function () {
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(2);
    });
    
    it("Should return 0 count for product with no milestones", async function () {
      const newProductId = keccak256(toUtf8Bytes(`NewProduct-${Date.now()}`));
      
      // Register new product but don't add milestones
      await productRegistry.connect(manufacturer).registerProduct(
        newProductId,
        "New Product",
        manufacturer.address
      );
      
      const count = await supplyChainTracker.getMilestoneCount(newProductId);
      expect(count).to.equal(0);
    });
    
    it("Should retrieve milestone by index", async function () {
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 1);
      
      expect(milestone[0]).to.equal("Packaged");
      expect(milestone[1]).to.equal("Product packaged for shipping");
      expect(milestone[3]).to.equal(supplier.address);
    });
    
    it("Should revert when retrieving milestone with out-of-bounds index", async function () {
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });

    it("Should allow anyone to retrieve milestones", async function() {
      // Connect with nonSupplier (who doesn't have any role)
      const milestones = await supplyChainTracker.connect(nonSupplier).getProductMilestones(productId);
      
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
    });
  });
});
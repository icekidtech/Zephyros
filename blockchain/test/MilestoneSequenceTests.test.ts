import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone Sequence Tests", function () {
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
      "Test Product for Sequence Testing",
      manufacturer.address
    );
  });

  describe("Milestone Sequencing", function() {
    it("Should maintain correct order for many milestones", async function() {
      // Define timestamps in chronological order
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 72000, // 20 hours ago
        Math.floor(Date.now() / 1000) - 57600, // 16 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 28800, // 8 hours ago
      ];
      
      // Define milestone types and details
      const milestoneData = [
        { type: "Raw Materials", details: "Raw materials procured" },
        { type: "Production", details: "Production started" },
        { type: "Quality Control", details: "QC passed" },
        { type: "Packaged", details: "Product packaged" },
        { type: "Shipped", details: "Product shipped" }
      ];
      
      // Add milestones in sequence
      for (let i = 0; i < milestoneData.length; i++) {
        await supplyChainTracker.connect(supplier).addMilestone(
          productId,
          milestoneData[i].type,
          milestoneData[i].details,
          timestamps[i]
        );
      }
      
      // Fetch all milestones
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      
      expect(milestones.length).to.equal(milestoneData.length);
      
      for (let i = 0; i < milestoneData.length; i++) {
        expect(milestones[i].milestoneType).to.equal(milestoneData[i].type);
        expect(milestones[i].details).to.equal(milestoneData[i].details);
        expect(milestones[i].timestamp).to.equal(timestamps[i]);
      }
    });
    
    it("Should handle out-of-sequence timestamp addition correctly", async function() {
      // Define non-chronological timestamps
      const timestamp1 = Math.floor(Date.now() / 1000) - 43200; // 12 hours ago
      const timestamp2 = Math.floor(Date.now() / 1000) - 86400; // 24 hours ago (earlier than timestamp1)
      
      // Add milestones out of chronological order
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        timestamp1
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufacturing completed",
        timestamp2 // Earlier than the first milestone
      );
      
      // Fetch milestones
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      
      // Verify milestones were stored in the order they were added (not by timestamp)
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Packaged");
      expect(milestones[0].timestamp).to.equal(timestamp1);
      expect(milestones[1].milestoneType).to.equal("Manufactured");
      expect(milestones[1].timestamp).to.equal(timestamp2);
    });
    
    it("Should handle large number of milestones", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const numMilestones = 10; // Test with 10 milestones
      
      // Add multiple milestones
      for (let i = 0; i < numMilestones; i++) {
        await supplyChainTracker.connect(supplier).addMilestone(
          productId,
          `Milestone ${i}`,
          `Details for milestone ${i}`,
          timestamp - (i * 60) // Each milestone is 1 minute apart
        );
      }
      
      // Verify milestone count
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(numMilestones);
      
      // Fetch all milestones
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      expect(milestones.length).to.equal(numMilestones);
      
      // Verify first and last milestone
      expect(milestones[0].milestoneType).to.equal("Milestone 0");
      expect(milestones[numMilestones-1].milestoneType).to.equal(`Milestone ${numMilestones-1}`);
    });
  });
});
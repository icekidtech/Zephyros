import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  ProductRegistry,
  SupplyChainTracker,
  VerificationSystem,
  ConsumerInterface
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone-Specific Tests", function () {
  // Contract instances
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  let consumerInterface: ConsumerInterface;
  
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
    
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
    consumerInterface = await ConsumerInterfaceFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await supplyChainTracker.getAddress()
    );
    
    // Verify participants
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    
    // Generate a unique product ID and register product
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    await productRegistry.connect(manufacturer).registerProduct(
      productId,
      "Test Product for Milestones",
      manufacturer.address
    );
  });

  describe("Milestone Addition and Retrieval", function () {
    it("Should maintain correct order for multiple milestones", async function () {
      // Define timestamps in chronological order
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 72000, // 20 hours ago
        Math.floor(Date.now() / 1000) - 57600, // 16 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 28800, // 8 hours ago
        Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
        Math.floor(Date.now() / 1000) - 3600   // 1 hour ago
      ];
      
      // Define milestone types and details
      const milestoneData = [
        { type: "Raw Materials Procured", details: "Raw materials procured from supplier X" },
        { type: "Production Started", details: "Started production batch #12345" },
        { type: "Quality Control", details: "Passed quality control checks" },
        { type: "Manufactured", details: "Product manufacturing completed" },
        { type: "Packaged", details: "Product packaged for shipping" },
        { type: "Shipped", details: "Product shipped from warehouse A" },
        { type: "Delivered", details: "Product delivered to distributor B" }
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
      
      // Verify milestone count
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(milestoneData.length);
      
      // Fetch and verify all milestones via consumer interface
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(productId);
      
      // Verify milestones were stored in the correct order
      expect(milestones.length).to.equal(milestoneData.length);
      
      for (let i = 0; i < milestoneData.length; i++) {
        expect(milestones[i].milestoneType).to.equal(milestoneData[i].type);
        expect(milestones[i].details).to.equal(milestoneData[i].details);
        expect(milestones[i].timestamp).to.equal(timestamps[i]);
        expect(milestones[i].participant).to.equal(supplier.address);
      }
    });

    it("Should handle out-of-sequence timestamp addition correctly", async function () {
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
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify milestones were stored in the order they were added (not by timestamp)
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Packaged");
      expect(milestones[0].timestamp).to.equal(timestamp1);
      expect(milestones[1].milestoneType).to.equal("Manufactured");
      expect(milestones[1].timestamp).to.equal(timestamp2);
    });

    it("Should handle large number of milestones", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const numMilestones = 20; // Test with 20 milestones
      
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
      const milestones = await consumerInterface.getProductMilestones(productId);
      expect(milestones.length).to.equal(numMilestones);
      
      // Verify first and last milestone
      expect(milestones[0].milestoneType).to.equal("Milestone 0");
      expect(milestones[numMilestones-1].milestoneType).to.equal(`Milestone ${numMilestones-1}`);
    });

    it("Should fetch individual milestones by index correctly", async function () {
      // Add three milestones
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 3600   // 1 hour ago
      ];
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at facility X",
        timestamps[0]
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        timestamps[1]
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Shipped",
        "Product shipped to distributor",
        timestamps[2]
      );
      
      // Fetch middle milestone by index
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 1);
      
      // Verify milestone data
      expect(milestone[0]).to.equal("Packaged");
      expect(milestone[1]).to.equal("Product packaged for shipping");
      expect(milestone[2]).to.equal(timestamps[1]);
      expect(milestone[3]).to.equal(supplier.address);
      
      // Verify out of bounds access
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });
  });

  describe("Special Milestone Scenarios", function() {
    it("Should handle unicode characters in milestone data", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Add milestone with unicode characters
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "测试里程碑", // Chinese characters for "Test Milestone"
        "This milestone contains emoji: 🚢📦✅ and special characters: ±§«»",
        timestamp
      );
      
      // Fetch milestone
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify unicode data was preserved
      expect(milestones[0].milestoneType).to.equal("测试里程碑");
      expect(milestones[0].details).to.equal("This milestone contains emoji: 🚢📦✅ and special characters: ±§«»");
    });

    it("Should handle adding milestones with exact same timestamp", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Add two milestones with identical timestamps
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Quality Check",
        "Product passed quality check",
        timestamp
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaging",
        "Product prepared for packaging",
        timestamp // Same timestamp
      );
      
      // Fetch milestones
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify both milestones exist with same timestamp
      expect(milestones.length).to.equal(2);
      expect(milestones[0].timestamp).to.equal(timestamp);
      expect(milestones[1].timestamp).to.equal(timestamp);
      expect(milestones[0].milestoneType).to.equal("Quality Check");
      expect(milestones[1].milestoneType).to.equal("Packaging");
    });

    it("Should handle maximum length strings in milestone data", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Create very long strings for type and details
      const longType = "A".repeat(100);    // 100 characters
      const longDetails = "B".repeat(1000); // 1000 characters
      
      // Add milestone with long strings
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        longType,
        longDetails,
        timestamp
      );
      
      // Fetch milestone
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify long strings were preserved
      expect(milestones[0].milestoneType).to.equal(longType);
      expect(milestones[0].details).to.equal(longDetails);
      expect(milestones[0].milestoneType.length).to.equal(100);
      expect(milestones[0].details.length).to.equal(1000);
    });
  });

  describe("Multi-Product Milestone Tracking", function() {
    it("Should correctly track milestones across multiple products", async function() {
      // Create two additional products
      const productId2 = keccak256(toUtf8Bytes(`Product2-${Date.now()}`));
      const productId3 = keccak256(toUtf8Bytes(`Product3-${Date.now()}`));
      
      // Register additional products
      await productRegistry.connect(manufacturer).registerProduct(
        productId2,
        "Second Test Product",
        manufacturer.address
      );
      
      await productRegistry.connect(manufacturer).registerProduct(
        productId3,
        "Third Test Product",
        manufacturer.address
      );
      
      // Add different milestones to each product
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Milestones for product 1
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Product 1 - Manufactured",
        "Product 1 manufacturing details",
        timestamp
      );
      
      // Milestones for product 2
      await supplyChainTracker.connect(supplier).addMilestone(
        productId2,
        "Product 2 - Manufactured",
        "Product 2 manufacturing details",
        timestamp - 100
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId2,
        "Product 2 - Packaged",
        "Product 2 packaging details",
        timestamp - 50
      );
      
      // Milestones for product 3
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Manufactured",
        "Product 3 manufacturing details",
        timestamp - 200
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Packaged",
        "Product 3 packaging details",
        timestamp - 150
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Shipped",
        "Product 3 shipping details",
        timestamp - 100
      );
      
      // Verify milestone counts
      expect(await supplyChainTracker.getMilestoneCount(productId)).to.equal(1);
      expect(await supplyChainTracker.getMilestoneCount(productId2)).to.equal(2);
      expect(await supplyChainTracker.getMilestoneCount(productId3)).to.equal(3);
      
      // Verify milestones for product 1
      const milestones1 = await consumerInterface.getProductMilestones(productId);
      expect(milestones1.length).to.equal(1);
      expect(milestones1[0].milestoneType).to.equal("Product 1 - Manufactured");// filepath: /home/icekid/Projects/Zephyros/blockchain/test/MilestoneTests.test.ts
import { expect } from "chai";
import { ethers } from "hardhat";
import { 
  ProductRegistry,
  SupplyChainTracker,
  VerificationSystem,
  ConsumerInterface
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone-Specific Tests", function () {
  // Contract instances
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  let consumerInterface: ConsumerInterface;
  
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
    
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
    consumerInterface = await ConsumerInterfaceFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await supplyChainTracker.getAddress()
    );
    
    // Verify participants
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    
    // Generate a unique product ID and register product
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    await productRegistry.connect(manufacturer).registerProduct(
      productId,
      "Test Product for Milestones",
      manufacturer.address
    );
  });

  describe("Milestone Addition and Retrieval", function () {
    it("Should maintain correct order for multiple milestones", async function () {
      // Define timestamps in chronological order
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 72000, // 20 hours ago
        Math.floor(Date.now() / 1000) - 57600, // 16 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 28800, // 8 hours ago
        Math.floor(Date.now() / 1000) - 14400, // 4 hours ago
        Math.floor(Date.now() / 1000) - 3600   // 1 hour ago
      ];
      
      // Define milestone types and details
      const milestoneData = [
        { type: "Raw Materials Procured", details: "Raw materials procured from supplier X" },
        { type: "Production Started", details: "Started production batch #12345" },
        { type: "Quality Control", details: "Passed quality control checks" },
        { type: "Manufactured", details: "Product manufacturing completed" },
        { type: "Packaged", details: "Product packaged for shipping" },
        { type: "Shipped", details: "Product shipped from warehouse A" },
        { type: "Delivered", details: "Product delivered to distributor B" }
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
      
      // Verify milestone count
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(milestoneData.length);
      
      // Fetch and verify all milestones via consumer interface
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(productId);
      
      // Verify milestones were stored in the correct order
      expect(milestones.length).to.equal(milestoneData.length);
      
      for (let i = 0; i < milestoneData.length; i++) {
        expect(milestones[i].milestoneType).to.equal(milestoneData[i].type);
        expect(milestones[i].details).to.equal(milestoneData[i].details);
        expect(milestones[i].timestamp).to.equal(timestamps[i]);
        expect(milestones[i].participant).to.equal(supplier.address);
      }
    });

    it("Should handle out-of-sequence timestamp addition correctly", async function () {
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
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify milestones were stored in the order they were added (not by timestamp)
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Packaged");
      expect(milestones[0].timestamp).to.equal(timestamp1);
      expect(milestones[1].milestoneType).to.equal("Manufactured");
      expect(milestones[1].timestamp).to.equal(timestamp2);
    });

    it("Should handle large number of milestones", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const numMilestones = 20; // Test with 20 milestones
      
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
      const milestones = await consumerInterface.getProductMilestones(productId);
      expect(milestones.length).to.equal(numMilestones);
      
      // Verify first and last milestone
      expect(milestones[0].milestoneType).to.equal("Milestone 0");
      expect(milestones[numMilestones-1].milestoneType).to.equal(`Milestone ${numMilestones-1}`);
    });

    it("Should fetch individual milestones by index correctly", async function () {
      // Add three milestones
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 3600   // 1 hour ago
      ];
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at facility X",
        timestamps[0]
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        timestamps[1]
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Shipped",
        "Product shipped to distributor",
        timestamps[2]
      );
      
      // Fetch middle milestone by index
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 1);
      
      // Verify milestone data
      expect(milestone[0]).to.equal("Packaged");
      expect(milestone[1]).to.equal("Product packaged for shipping");
      expect(milestone[2]).to.equal(timestamps[1]);
      expect(milestone[3]).to.equal(supplier.address);
      
      // Verify out of bounds access
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });
  });

  describe("Special Milestone Scenarios", function() {
    it("Should handle unicode characters in milestone data", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Add milestone with unicode characters
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "测试里程碑", // Chinese characters for "Test Milestone"
        "This milestone contains emoji: 🚢📦✅ and special characters: ±§«»",
        timestamp
      );
      
      // Fetch milestone
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify unicode data was preserved
      expect(milestones[0].milestoneType).to.equal("测试里程碑");
      expect(milestones[0].details).to.equal("This milestone contains emoji: 🚢📦✅ and special characters: ±§«»");
    });

    it("Should handle adding milestones with exact same timestamp", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Add two milestones with identical timestamps
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Quality Check",
        "Product passed quality check",
        timestamp
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaging",
        "Product prepared for packaging",
        timestamp // Same timestamp
      );
      
      // Fetch milestones
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify both milestones exist with same timestamp
      expect(milestones.length).to.equal(2);
      expect(milestones[0].timestamp).to.equal(timestamp);
      expect(milestones[1].timestamp).to.equal(timestamp);
      expect(milestones[0].milestoneType).to.equal("Quality Check");
      expect(milestones[1].milestoneType).to.equal("Packaging");
    });

    it("Should handle maximum length strings in milestone data", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Create very long strings for type and details
      const longType = "A".repeat(100);    // 100 characters
      const longDetails = "B".repeat(1000); // 1000 characters
      
      // Add milestone with long strings
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        longType,
        longDetails,
        timestamp
      );
      
      // Fetch milestone
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      // Verify long strings were preserved
      expect(milestones[0].milestoneType).to.equal(longType);
      expect(milestones[0].details).to.equal(longDetails);
      expect(milestones[0].milestoneType.length).to.equal(100);
      expect(milestones[0].details.length).to.equal(1000);
    });
  });

  describe("Multi-Product Milestone Tracking", function() {
    it("Should correctly track milestones across multiple products", async function() {
      // Create two additional products
      const productId2 = keccak256(toUtf8Bytes(`Product2-${Date.now()}`));
      const productId3 = keccak256(toUtf8Bytes(`Product3-${Date.now()}`));
      
      // Register additional products
      await productRegistry.connect(manufacturer).registerProduct(
        productId2,
        "Second Test Product",
        manufacturer.address
      );
      
      await productRegistry.connect(manufacturer).registerProduct(
        productId3,
        "Third Test Product",
        manufacturer.address
      );
      
      // Add different milestones to each product
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      
      // Milestones for product 1
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Product 1 - Manufactured",
        "Product 1 manufacturing details",
        timestamp
      );
      
      // Milestones for product 2
      await supplyChainTracker.connect(supplier).addMilestone(
        productId2,
        "Product 2 - Manufactured",
        "Product 2 manufacturing details",
        timestamp - 100
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId2,
        "Product 2 - Packaged",
        "Product 2 packaging details",
        timestamp - 50
      );
      
      // Milestones for product 3
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Manufactured",
        "Product 3 manufacturing details",
        timestamp - 200
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Packaged",
        "Product 3 packaging details",
        timestamp - 150
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId3,
        "Product 3 - Shipped",
        "Product 3 shipping details",
        timestamp - 100
      );
      
      // Verify milestone counts
      expect(await supplyChainTracker.getMilestoneCount(productId)).to.equal(1);
      expect(await supplyChainTracker.getMilestoneCount(productId2)).to.equal(2);
      expect(await supplyChainTracker.getMilestoneCount(productId3)).to.equal(3);
      
      // Verify milestones for product 1
      const milestones1 = await consumerInterface.getProductMilestones(productId);
      expect(milestones1.length).to.equal(1);
      expect(milestones1[0].milestoneType).to.equal("Product 1 - Manufactured");
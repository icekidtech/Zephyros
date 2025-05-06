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

describe("Milestone Basic Tests", function () {
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

  describe("Basic Milestone Addition", function() {
    it("Should successfully add a milestone", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      const tx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at Facility A",
        timestamp
      );
      
      await expect(tx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 0, supplier.address);
      
      // Verify milestone was added
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
      expect(milestones[0].details).to.equal("Product manufactured at Facility A");
      expect(milestones[0].timestamp).to.equal(timestamp);
      expect(milestones[0].participant).to.equal(supplier.address);
    });
    
    it("Should add multiple milestones in sequence", async function() {
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 43200, // 12 hours ago
        Math.floor(Date.now() / 1000) - 3600   // 1 hour ago
      ];
      
      const milestoneData = [
        { type: "Manufactured", details: "Product manufactured at Facility A" },
        { type: "Packaged", details: "Product packaged for shipping" },
        { type: "Shipped", details: "Product shipped to warehouse" }
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
      
      // Verify all milestones were added
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      expect(milestones.length).to.equal(3);
      
      // Verify milestone data
      for (let i = 0; i < milestoneData.length; i++) {
        expect(milestones[i].milestoneType).to.equal(milestoneData[i].type);
        expect(milestones[i].details).to.equal(milestoneData[i].details);
        expect(milestones[i].timestamp).to.equal(timestamps[i]);
        expect(milestones[i].participant).to.equal(supplier.address);
      }
    });
  });
  
  describe("Basic Milestone Retrieval", function() {
    beforeEach(async function() {
      // Add some milestones for retrieval tests
      const timestamps = [
        Math.floor(Date.now() / 1000) - 86400, // 24 hours ago
        Math.floor(Date.now() / 1000) - 43200  // 12 hours ago
      ];
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at Facility A",
        timestamps[0]
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        timestamps[1]
      );
    });
    
    it("Should retrieve all milestones via getProductMilestones", async function() {
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
      expect(milestones[1].milestoneType).to.equal("Packaged");
    });
    
    it("Should retrieve a specific milestone via getMilestoneAtIndex", async function() {
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 1);
      
      expect(milestone[0]).to.equal("Packaged");
      expect(milestone[1]).to.equal("Product packaged for shipping");
    });
    
    it("Should return correct milestone count", async function() {
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(2);
    });
    
    it("Should allow anyone to view milestones", async function() {
      // Consumer (non-verified) should be able to view milestones
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(productId);
      expect(milestones.length).to.equal(2);
    });
  });
  
  describe("Basic Error Cases", function() {
    it("Should revert when non-verified supplier tries to add milestone", async function() {
      await expect(
        supplyChainTracker.connect(consumer).addMilestone(
          productId,
          "Shipped",
          "Product shipped to store",
          Math.floor(Date.now() / 1000) - 3600
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should revert when querying non-existent product", async function() {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        supplyChainTracker.getProductMilestones(nonExistentId)
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
    
    it("Should revert when retrieving milestone with invalid index", async function() {
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at Facility A",
        Math.floor(Date.now() / 1000) - 3600
      );
      
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });
  });
});
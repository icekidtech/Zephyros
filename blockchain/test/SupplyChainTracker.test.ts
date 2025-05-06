import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("SupplyChainTracker", function () {
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let owner: SignerWithAddress;
  let nonOwner: SignerWithAddress;
  let manufacturerAddress: SignerWithAddress;
  let productId: string;

  beforeEach(async function () {
    // Get signers
    [owner, nonOwner, manufacturerAddress] = await ethers.getSigners();
    
    // Deploy ProductRegistry first
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(owner).deploy();
    
    // Deploy SupplyChainTracker with ProductRegistry address
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(owner).deploy(
      await productRegistry.getAddress()
    );
    
    // Create a unique product ID using keccak256
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    
    // Register a product in ProductRegistry
    await productRegistry.connect(owner).registerProduct(
      productId,
      "Test Product",
      manufacturerAddress.address
    );
  });

  describe("Milestone Addition", function () {
    it("Should allow owner to add a milestone for an existing product", async function () {
      const milestoneType = "Manufactured";
      const details = "Product manufactured in Facility A";
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      // Add milestone
      const tx = await supplyChainTracker.addMilestone(
        productId,
        milestoneType,
        details,
        timestamp
      );
      
      // Check that event was emitted with correct parameters
      await expect(tx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 0, owner.address);
      
      // Verify milestone count
      const milestoneCount = await supplyChainTracker.getMilestoneCount(productId);
      expect(milestoneCount).to.equal(1);
      
      // Verify milestone data
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 0);
      expect(milestone[0]).to.equal(milestoneType);
      expect(milestone[1]).to.equal(details);
      expect(milestone[2]).to.equal(timestamp);
      expect(milestone[3]).to.equal(owner.address);
    });
    
    it("Should revert when adding milestone for non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.addMilestone(
          nonExistentId,
          "Manufactured",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
    
    it("Should revert when non-owner tries to add a milestone", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.connect(nonOwner).addMilestone(
          productId,
          "Manufactured",
          "Details",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "OwnableUnauthorizedAccount");
    });
    
    it("Should revert when adding milestone with future timestamp", async function () {
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      
      await expect(
        supplyChainTracker.addMilestone(
          productId,
          "Manufactured",
          "Details",
          futureTimestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "InvalidTimestamp");
    });
    
    it("Should revert when milestone type is empty", async function () {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await expect(
        supplyChainTracker.addMilestone(
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
        supplyChainTracker.addMilestone(
          productId,
          "Manufactured",
          "",
          timestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneDetails");
    });
  });
  
  describe("Milestone Retrieval", function () {
    beforeEach(async function () {
      // Add some milestones for testing retrieval
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
      
      await supplyChainTracker.addMilestone(
        productId,
        "Manufactured",
        "Product manufactured in Facility A",
        twoHoursAgo
      );
      
      await supplyChainTracker.addMilestone(
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
      await productRegistry.registerProduct(
        newProductId,
        "New Product",
        manufacturerAddress.address
      );
      
      const count = await supplyChainTracker.getMilestoneCount(newProductId);
      expect(count).to.equal(0);
    });
    
    it("Should retrieve milestone by index", async function () {
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 1);
      
      expect(milestone[0]).to.equal("Packaged");
      expect(milestone[1]).to.equal("Product packaged for shipping");
      expect(milestone[3]).to.equal(owner.address);
    });
    
    it("Should revert when retrieving milestone with out-of-bounds index", async function () {
      await expect(
        supplyChainTracker.getMilestoneAtIndex(productId, 99)
      ).to.be.revertedWith("Milestone index out of bounds");
    });
  });
});
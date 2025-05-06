import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("Milestone Basic Tests", function () {
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
    
    // Verify participants using explicit typing to fix the error
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
      "Test Product",
      manufacturer.address
    );
  });

  describe("Basic Milestone Operations", function() {
    it("Should allow verified supplier to add a milestone", async function() {
      const milestoneType = "Manufactured";
      const details = "Product manufactured in Factory A";
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        milestoneType,
        details,
        timestamp
      );
      
      // Check milestone was added
      const milestones = await supplyChainTracker.getProductMilestones(productId);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal(milestoneType);
      expect(milestones[0].details).to.equal(details);
      expect(milestones[0].timestamp).to.equal(timestamp);
      expect(milestones[0].participant).to.equal(supplier.address);
    });

    it("Should emit MilestoneAdded event when adding a milestone", async function() {
      const milestoneType = "Shipped";
      const details = "Product shipped from warehouse";
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      const tx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        milestoneType,
        details,
        timestamp
      );
      
      await expect(tx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 0, supplier.address);
    });
    
    it("Should get correct milestone count", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured",
        timestamp
      );
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged",
        timestamp - 1800 // 30 minutes before
      );
      
      const count = await supplyChainTracker.getMilestoneCount(productId);
      expect(count).to.equal(2);
    });
    
    it("Should retrieve milestone by index", async function() {
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured",
        timestamp
      );
      
      const milestone = await supplyChainTracker.getMilestoneAtIndex(productId, 0);
      expect(milestone[0]).to.equal("Manufactured");
      expect(milestone[1]).to.equal("Product manufactured");
      expect(milestone[2]).to.equal(timestamp);
      expect(milestone[3]).to.equal(supplier.address);
    });
  });
});
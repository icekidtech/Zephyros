import { expect } from "chai";
import { ethers } from "hardhat";
import { ProductRegistry, SupplyChainTracker, ConsumerInterface, VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";

describe("ConsumerInterface", function () {
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let consumerInterface: ConsumerInterface;
  let verificationSystem: VerificationSystem;
  let owner: SignerWithAddress;
  let consumer: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let productId: string;
  
  beforeEach(async function () {
    // Get signers
    [owner, consumer, manufacturer] = await ethers.getSigners();
    
    // Deploy VerificationSystem first
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(owner).deploy();
    
    // Deploy ProductRegistry with VerificationSystem address
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(owner).deploy(
      await verificationSystem.getAddress()
    );
    
    // Deploy SupplyChainTracker with ProductRegistry and VerificationSystem addresses
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(owner).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    // Deploy ConsumerInterface
    const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
    consumerInterface = await ConsumerInterfaceFactory.connect(owner).deploy(
      await productRegistry.getAddress(),
      await supplyChainTracker.getAddress()
    );
    
    // Create a unique product ID
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
    
    // Register a product in ProductRegistry - verify manufacturer first
    await verificationSystem.connect(owner)["verifyParticipant"](manufacturer.address, await verificationSystem.MANUFACTURER_ROLE());
    
    // Then register the product
    await productRegistry.connect(manufacturer).registerProduct(
      productId,
      "Test Product",
      manufacturer.address
    );
  });
  
  describe("Deployment", function () {
    it("Should store the correct ProductRegistry address", async function () {
      expect(await consumerInterface.productRegistry()).to.equal(
        await productRegistry.getAddress()
      );
    });
    
    it("Should store the correct SupplyChainTracker address", async function () {
      expect(await consumerInterface.supplyChainTracker()).to.equal(
        await supplyChainTracker.getAddress()
      );
    });
    
    it("Should revert if deployed with zero addresses", async function () {
      const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
      
      await expect(
        ConsumerInterfaceFactory.deploy(
          ethers.ZeroAddress,
          await supplyChainTracker.getAddress()
        )
      ).to.be.revertedWithCustomError(ConsumerInterfaceFactory, "InvalidContractAddress");
      
      await expect(
        ConsumerInterfaceFactory.deploy(
          await productRegistry.getAddress(),
          ethers.ZeroAddress
        )
      ).to.be.revertedWithCustomError(ConsumerInterfaceFactory, "InvalidContractAddress");
    });
  });
  
  describe("Product Queries", function () {
    it("Should retrieve product details correctly", async function () {
      const details = await consumerInterface.getProductDetails(productId);
      
      expect(details[0]).to.equal(productId);
      expect(details[1]).to.equal("Test Product");
      expect(details[2]).to.equal(manufacturer.address);
      expect(details[3]).to.be.gt(0); // timestamp should be non-zero
    });
    
    it("Should revert when querying non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        consumerInterface.getProductDetails(nonExistentId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
    });
    
    it("Should check if a product exists", async function () {
      expect(await consumerInterface.productExists(productId)).to.be.true;
      
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      expect(await consumerInterface.productExists(nonExistentId)).to.be.false;
    });
  });
  
  describe("Milestone Queries", function () {
    beforeEach(async function () {
      // Add milestones for the test product
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      const twoHoursAgo = Math.floor(Date.now() / 1000) - 7200;
      
      await supplyChainTracker.connect(owner).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured in Facility A",
        twoHoursAgo
      );
      
      await supplyChainTracker.connect(owner).addMilestone(
        productId,
        "Packaged",
        "Product packaged for shipping",
        oneHourAgo
      );
    });
    
    it("Should retrieve milestone history correctly", async function () {
      const milestones = await consumerInterface.getProductMilestones(productId);
      
      expect(milestones.length).to.equal(2);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
      expect(milestones[0].details).to.equal("Product manufactured in Facility A");
      expect(milestones[1].milestoneType).to.equal("Packaged");
      expect(milestones[1].details).to.equal("Product packaged for shipping");
    });
    
    it("Should revert when querying milestones for non-existent product", async function () {
      const nonExistentId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      await expect(
        consumerInterface.getProductMilestones(nonExistentId)
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });
  });
  
  describe("Consumer Access", function () {
    it("Should allow any address to query product details", async function () {
      // Query from consumer account
      const details = await consumerInterface.connect(consumer).getProductDetails(productId);
      expect(details[0]).to.equal(productId);
      expect(details[1]).to.equal("Test Product");
    });
    
    it("Should allow any address to query milestone history", async function () {
      // Add a milestone first
      const oneHourAgo = Math.floor(Date.now() / 1000) - 3600;
      await supplyChainTracker.connect(owner).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured in Facility A",
        oneHourAgo
      );
      
      // Query from consumer account
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(productId);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
    });
  });
});
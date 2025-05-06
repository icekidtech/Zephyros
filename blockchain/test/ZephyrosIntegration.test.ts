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

describe("Zephyros Integration Tests", function () {
  let productRegistry: ProductRegistry;
  let supplyChainTracker: SupplyChainTracker;
  let verificationSystem: VerificationSystem;
  let consumerInterface: ConsumerInterface;
  
  let admin: SignerWithAddress;
  let manufacturer: SignerWithAddress;
  let supplier: SignerWithAddress;
  let consumer: SignerWithAddress;
  
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;
  
  let productId: string;
  let productName: string = "Authentic Product";

  beforeEach(async function () {
    // Get signers
    [admin, manufacturer, supplier, consumer] = await ethers.getSigners();
    
    // Deploy contracts in proper sequence
    console.log("Deploying contracts...");
    
    // 1. Deploy VerificationSystem first
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get role constants
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
    
    // 2. Deploy ProductRegistry with VerificationSystem address
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    
    // 3. Deploy SupplyChainTracker with ProductRegistry and VerificationSystem addresses
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    
    // 4. Deploy ConsumerInterface with ProductRegistry and SupplyChainTracker addresses
    const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
    consumerInterface = await ConsumerInterfaceFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await supplyChainTracker.getAddress()
    );
    
    // 5. Set up users with appropriate roles
    await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    
    // Generate a unique product ID
    productId = keccak256(toUtf8Bytes(`Product-${Date.now()}`));
  });

  describe("End-to-End Supply Chain Flow", function () {
    it("Should successfully complete an end-to-end supply chain flow", async function () {
      // Step 1: Register a product as a verified manufacturer
      console.log("Registering product...");
      const registerTx = await productRegistry.connect(manufacturer).registerProduct(
        productId, 
        productName,
        manufacturer.address
      );
      
      await expect(registerTx)
        .to.emit(productRegistry, "ProductRegistered")
        .withArgs(productId, manufacturer.address);
      
      // Step 2: Add manufacturing milestone as a verified supplier
      const manufacturingTimestamp = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      const manufacturingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at Facility XYZ",
        manufacturingTimestamp
      );
      
      await expect(manufacturingMilestoneTx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 0, supplier.address);
      
      // Step 3: Add packaging milestone as a verified supplier
      const packagingTimestamp = Math.floor(Date.now() / 1000) - 43200; // 12 hours ago
      const packagingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for distribution",
        packagingTimestamp
      );
      
      await expect(packagingMilestoneTx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 1, supplier.address);
      
      // Step 4: Add shipping milestone as a verified supplier
      const shippingTimestamp = Math.floor(Date.now() / 1000) - 21600; // 6 hours ago
      const shippingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Shipped",
        "Product shipped to Distributor ABC",
        shippingTimestamp
      );
      
      await expect(shippingMilestoneTx)
        .to.emit(supplyChainTracker, "MilestoneAdded")
        .withArgs(productId, 2, supplier.address);
      
      // Step 5: Consumer queries product details and verifies authenticity
      const productDetails = await consumerInterface.connect(consumer).getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal(productName);
      expect(productDetails[2]).to.equal(manufacturer.address);
      
      // Step 6: Consumer views milestone history
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(productId);
      expect(milestones.length).to.equal(3);
      
      // Verify milestone details
      expect(milestones[0].milestoneType).to.equal("Manufactured");
      expect(milestones[0].details).to.equal("Product manufactured at Facility XYZ");
      expect(milestones[0].timestamp).to.equal(manufacturingTimestamp);
      expect(milestones[0].participant).to.equal(supplier.address);
      
      expect(milestones[1].milestoneType).to.equal("Packaged");
      expect(milestones[1].details).to.equal("Product packaged for distribution");
      expect(milestones[1].timestamp).to.equal(packagingTimestamp);
      expect(milestones[1].participant).to.equal(supplier.address);
      
      expect(milestones[2].milestoneType).to.equal("Shipped");
      expect(milestones[2].details).to.equal("Product shipped to Distributor ABC");
      expect(milestones[2].timestamp).to.equal(shippingTimestamp);
      expect(milestones[2].participant).to.equal(supplier.address);
    });
  });

  describe("Role Revocation Scenarios", function() {
    let revokedProductId: string;
    
    beforeEach(async function() {
      // Create a new product ID for this test section
      revokedProductId = keccak256(toUtf8Bytes(`RevokedProduct-${Date.now()}`));
      
      // Register product with verified manufacturer
      await productRegistry.connect(manufacturer).registerProduct(
        revokedProductId,
        "Product for Revocation Tests",
        manufacturer.address
      );
    });
    
    it("Should block product registration after manufacturer verification is revoked", async function() {
      // Revoke manufacturer verification
      await verificationSystem.connect(admin).revokeVerification(manufacturer.address);
      
      // Try to register another product
      const newProductId = keccak256(toUtf8Bytes(`NewProduct-${Date.now()}`));
      
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          newProductId,
          "Product After Revocation",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
    });
    
    it("Should block milestone addition after supplier verification is revoked", async function() {
      // Add a milestone first
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await supplyChainTracker.connect(supplier).addMilestone(
        revokedProductId,
        "Manufactured",
        "Initial milestone before revocation",
        timestamp
      );
      
      // Revoke supplier verification
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      // Try to add another milestone
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          revokedProductId,
          "Packaged",
          "After revocation milestone",
          timestamp - 1800
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
    });
    
    it("Should still allow consumers to query products after role revocations", async function() {
      // Add a milestone
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      await supplyChainTracker.connect(supplier).addMilestone(
        revokedProductId,
        "Manufactured",
        "Initial milestone",
        timestamp
      );
      
      // Revoke both manufacturer and supplier
      await verificationSystem.connect(admin).revokeVerification(manufacturer.address);
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      // Consumer should still be able to query data
      const productDetails = await consumerInterface.connect(consumer).getProductDetails(revokedProductId);
      expect(productDetails[0]).to.equal(revokedProductId);
      
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(revokedProductId);
      expect(milestones.length).to.equal(1);
      expect(milestones[0].milestoneType).to.equal("Manufactured");
    });
  });

  describe("Error Handling", function() {
    it("Should properly handle non-existent product queries", async function() {
      const nonExistentProductId = keccak256(toUtf8Bytes("NonExistentProduct"));
      
      // Try to query non-existent product via ConsumerInterface
      await expect(
        consumerInterface.connect(consumer).getProductDetails(nonExistentProductId)
      ).to.be.revertedWithCustomError(productRegistry, "ProductNotFound");
      
      // Try to add milestone to non-existent product
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          nonExistentProductId,
          "Manufactured",
          "Details",
          Math.floor(Date.now() / 1000) - 3600
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
      
      // Try to get milestones for non-existent product
      await expect(
        consumerInterface.connect(consumer).getProductMilestones(nonExistentProductId)
      ).to.be.revertedWithCustomError(supplyChainTracker, "ProductNotFound");
    });

    it("Should reject invalid milestone data", async function() {
      // Try to add milestone with future timestamp
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Future Milestone",
          "This is from the future",
          futureTimestamp
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "InvalidTimestamp");
      
      // Try to add milestone with empty type
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "",
          "Missing type",
          Math.floor(Date.now() / 1000) - 3600
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneType");
      
      // Try to add milestone with empty details
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Valid Type",
          "",
          Math.floor(Date.now() / 1000) - 3600
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "EmptyMilestoneDetails");
    });
  });
});
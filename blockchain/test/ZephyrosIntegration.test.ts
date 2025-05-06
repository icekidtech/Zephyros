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

describe("Zephyros System Integration", function () {
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
  let productName = "Premium Pharmaceutical Drug";
  let ADMIN_ROLE: string;
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;

  before(async function () {
    // Get signers
    [admin, manufacturer, supplier, consumer] = await ethers.getSigners();
    
    // Step 1: Deploy VerificationSystem
    console.log("Deploying VerificationSystem...");
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    console.log(`VerificationSystem deployed to ${await verificationSystem.getAddress()}`);
    
    // Get role constants
    ADMIN_ROLE = await verificationSystem.ADMIN_ROLE();
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
    
    // Step 2: Deploy ProductRegistry with VerificationSystem address
    console.log("Deploying ProductRegistry...");
    const ProductRegistryFactory = await ethers.getContractFactory("ProductRegistry");
    productRegistry = await ProductRegistryFactory.connect(admin).deploy(await verificationSystem.getAddress());
    console.log(`ProductRegistry deployed to ${await productRegistry.getAddress()}`);
    
    // Step 3: Deploy SupplyChainTracker with ProductRegistry and VerificationSystem addresses
    console.log("Deploying SupplyChainTracker...");
    const SupplyChainTrackerFactory = await ethers.getContractFactory("SupplyChainTracker");
    supplyChainTracker = await SupplyChainTrackerFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await verificationSystem.getAddress()
    );
    console.log(`SupplyChainTracker deployed to ${await supplyChainTracker.getAddress()}`);
    
    // Step 4: Deploy ConsumerInterface with ProductRegistry and SupplyChainTracker addresses
    console.log("Deploying ConsumerInterface...");
    const ConsumerInterfaceFactory = await ethers.getContractFactory("ConsumerInterface");
    consumerInterface = await ConsumerInterfaceFactory.connect(admin).deploy(
      await productRegistry.getAddress(),
      await supplyChainTracker.getAddress()
    );
    console.log(`ConsumerInterface deployed to ${await consumerInterface.getAddress()}`);
    
    // Step 5: Verify manufacturer and supplier
    console.log("Verifying participants...");
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
        "Revocation Test Product",
        manufacturer.address
      );
    });

    it("Should prevent revoked manufacturer from registering products", async function() {
      // Revoke manufacturer verification
      await verificationSystem.connect(admin).revokeVerification(manufacturer.address);
      
      // Try to register a product with revoked manufacturer role
      const newProductId = keccak256(toUtf8Bytes(`NewProduct-${Date.now()}`));
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          newProductId,
          "New Test Product",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
      
      // Re-verify the manufacturer to maintain state for other tests
      await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
    });

    it("Should prevent revoked supplier from adding milestones", async function() {
      // First add a milestone as verified supplier
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      await supplyChainTracker.connect(supplier).addMilestone(
        revokedProductId,
        "Manufactured",
        "Manufactured at location X",
        timestamp
      );
      
      // Now revoke supplier verification
      await verificationSystem.connect(admin).revokeVerification(supplier.address);
      
      // Try to add another milestone with revoked supplier role
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          revokedProductId,
          "Shipped",
          "Shipped to destination Y",
          timestamp - 1800 // 30 minutes later
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
      
      // Re-verify the supplier to maintain state for other tests
      await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
    });
  });

  describe("Error Handling and Edge Cases", function() {
    it("Should reject operations on non-existent products", async function() {
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
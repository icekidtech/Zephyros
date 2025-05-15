import { expect } from "chai";
import { ethers } from "hardhat"
import type { JsonRpcProvider } from "ethers";
import { 
  ProductRegistry, 
  SupplyChainTracker, 
  VerificationSystem,
  ConsumerInterface
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { keccak256, toUtf8Bytes } from "ethers";
import fs from 'fs';
import path from 'path';
import { Avalanche } from "@avalabs/avalanchejs";
import { Contract } from "ethers";

// Import ABIs
import VerificationSystemABI from "../artifacts/contracts/VerificationSystem.sol/VerificationSystem.json";
import ProductRegistryABI from "../artifacts/contracts/ProductRegistry.sol/ProductRegistry.json";
import SupplyChainTrackerABI from "../artifacts/contracts/SupplyChainTracker.sol/SupplyChainTracker.json";

// Test configuration
const TEST_TIMEOUT = 120000; // 2 minutes timeout for testnet operations

describe("Zephyros Integration Tests (Fuji Testnet)", function () {
  // Set extended timeout for testnet operations
  this.timeout(TEST_TIMEOUT);

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
  
  // Contract addresses from deployed-addresses.json
  let contractAddresses: {
    VerificationSystem: string;
    ProductRegistry: string;
    SupplyChainTracker: string;
    ConsumerInterface: string;
  };
  
  // AvalancheJS for event monitoring
  let avalanche: Avalanche;
  let cChain: any;
  let provider: ethers.JsonRpcProvider;

  before(async function() {
    // Load contract addresses from deployed-addresses.json
    const addressesPath = path.join(__dirname, '../deployed-addresses.json');
    if (!fs.existsSync(addressesPath)) {
      throw new Error("deployed-addresses.json not found. Make sure contracts are deployed.");
    }
    contractAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));
    
    console.log("Using deployed contract addresses:", contractAddresses);
    
    // Setup AvalancheJS
    avalanche = new Avalanche("api.avax-test.network", 443, "https", 43113);
    cChain = avalanche.CChain();
    
    // Get provider from hardhat network configuration
    provider = ethers.provider as ethers.JsonRpcProvider;
    console.log(`Connected to network: ${(await provider.getNetwork()).name}`);
    
    try {
      // Get signers (should be configured to use Fuji testnet via --network fuji)
      [admin, manufacturer, supplier, consumer] = await ethers.getSigners();
      console.log(`Using admin address: ${admin.address}`);
      
      // Check balance to ensure we have funds for tests
      const balance = await provider.getBalance(admin.address);
      console.log(`Admin balance: ${ethers.formatEther(balance)} AVAX`);
      
      if (balance < ethers.parseEther("0.1")) {
        console.warn("Warning: Admin account has less than 0.1 AVAX. Tests may fail due to insufficient funds.");
      }
      
      // Connect to deployed contracts
      verificationSystem = await ethers.getContractAt(
        "VerificationSystem", 
        contractAddresses.VerificationSystem
      ) as unknown as VerificationSystem;
      
      productRegistry = await ethers.getContractAt(
        "ProductRegistry", 
        contractAddresses.ProductRegistry
      ) as unknown as ProductRegistry;
      
      supplyChainTracker = await ethers.getContractAt(
        "SupplyChainTracker", 
        contractAddresses.SupplyChainTracker
      ) as unknown as SupplyChainTracker;
      
      consumerInterface = await ethers.getContractAt(
        "ConsumerInterface", 
        contractAddresses.ConsumerInterface
      ) as unknown as ConsumerInterface;
      
      // Get role constants
      MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
      SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
      
      // Generate a unique product ID for testing
      productId = keccak256(toUtf8Bytes(`Product-Fuji-${Date.now()}`));
      
      console.log("Setup complete. Starting tests...");
    } catch (error) {
      console.error("Setup failed:", error);
      throw error;
    }
  });

  // Testing contract connectivity
  describe("Contract Connectivity", function() {
    it("Should successfully connect to deployed contracts", async function() {
      // Verify connection by checking addresses
      expect(await verificationSystem.getAddress()).to.equal(contractAddresses.VerificationSystem);
      expect(await productRegistry.getAddress()).to.equal(contractAddresses.ProductRegistry);
      expect(await supplyChainTracker.getAddress()).to.equal(contractAddresses.SupplyChainTracker);
      expect(await consumerInterface.getAddress()).to.equal(contractAddresses.ConsumerInterface);
    });
    
    it("Should verify contract dependencies are correctly set", async function() {
      // Check that ProductRegistry has the right VerificationSystem address
      expect(await productRegistry.verificationSystem()).to.equal(contractAddresses.VerificationSystem);
      
      // Check that SupplyChainTracker has the right addresses
      expect(await supplyChainTracker.productRegistry()).to.equal(contractAddresses.ProductRegistry);
      expect(await supplyChainTracker.verificationSystem()).to.equal(contractAddresses.VerificationSystem);
      
      // Check that ConsumerInterface has the right addresses
      expect(await consumerInterface.productRegistry()).to.equal(contractAddresses.ProductRegistry);
      expect(await consumerInterface.supplyChainTracker()).to.equal(contractAddresses.SupplyChainTracker);
    });
  });

  // Complete supply chain flow test
  describe("End-to-End Supply Chain Flow", function() {
    it("Should successfully complete an end-to-end supply chain flow", async function() {
      // Step 1: Verify participants
      console.log("Verifying manufacturer and supplier...");
      const verifyManuTx = await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
      console.log(`Manufacturer verification tx hash: ${verifyManuTx.hash}`);
      await verifyManuTx.wait();
      
      const verifySupplierTx = await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
      console.log(`Supplier verification tx hash: ${verifySupplierTx.hash}`);
      await verifySupplierTx.wait();
      
      // Check verification status
      expect(await verificationSystem.isVerifiedForRole(manufacturer.address, MANUFACTURER_ROLE)).to.equal(true);
      expect(await verificationSystem.isVerifiedForRole(supplier.address, SUPPLIER_ROLE)).to.equal(true);
      
      // Step 2: Register a product as a verified manufacturer
      console.log("Registering product...");
      const registerTx = await productRegistry.connect(manufacturer).registerProduct(
        productId, 
        productName,
        manufacturer.address
      );
      console.log(`Product registration tx hash: ${registerTx.hash}`);
      await registerTx.wait();
      
      // Verify product was registered
      const productExists = await productRegistry.productExists(productId);
      expect(productExists).to.equal(true);
      
      // Step 3: Add milestones as a verified supplier
      console.log("Adding milestones...");
      const manufacturingTimestamp = Math.floor(Date.now() / 1000) - 86400; // Yesterday
      const manufacturingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Manufactured",
        "Product manufactured at Facility XYZ",
        manufacturingTimestamp
      );
      console.log(`Manufacturing milestone tx hash: ${manufacturingMilestoneTx.hash}`);
      await manufacturingMilestoneTx.wait();
      
      const packagingTimestamp = Math.floor(Date.now() / 1000) - 43200; // 12 hours ago
      const packagingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Packaged",
        "Product packaged for distribution",
        packagingTimestamp
      );
      console.log(`Packaging milestone tx hash: ${packagingMilestoneTx.hash}`);
      await packagingMilestoneTx.wait();
      
      const shippingTimestamp = Math.floor(Date.now() / 1000) - 21600; // 6 hours ago
      const shippingMilestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        productId,
        "Shipped",
        "Product shipped to Distributor ABC",
        shippingTimestamp
      );
      console.log(`Shipping milestone tx hash: ${shippingMilestoneTx.hash}`);
      await shippingMilestoneTx.wait();
      
      // Step 4: Consumer queries product details and milestones
      console.log("Querying product details and milestones...");
      const productDetails = await consumerInterface.connect(consumer).getProductDetails(productId);
      expect(productDetails[0]).to.equal(productId);
      expect(productDetails[1]).to.equal(productName);
      expect(productDetails[2]).to.equal(manufacturer.address);
      
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
  
  // Role revocation tests
  describe("Role Revocation Scenarios", function() {
    let revokedProductId: string;
    
    before(async function() {
      // Create a new product ID for this test section
      revokedProductId = keccak256(toUtf8Bytes(`RevokedProduct-Fuji-${Date.now()}`));
      
      // Register product with verified manufacturer
      const registerTx = await productRegistry.connect(manufacturer).registerProduct(
        revokedProductId,
        "Product for Revocation Tests",
        manufacturer.address
      );
      await registerTx.wait();
      console.log(`Registered product for revocation tests: ${revokedProductId}`);
    });
    
    it("Should block product registration after manufacturer verification is revoked", async function() {
      // Revoke manufacturer verification
      const revokeTx = await verificationSystem.connect(admin).revokeVerification(manufacturer.address);
      console.log(`Manufacturer revocation tx hash: ${revokeTx.hash}`);
      await revokeTx.wait();
      
      // Verify revocation status
      const isVerified = await verificationSystem.isVerifiedForRole(manufacturer.address, MANUFACTURER_ROLE);
      expect(isVerified).to.equal(false);
      
      // Try to register another product
      const newProductId = keccak256(toUtf8Bytes(`NewProduct-${Date.now()}`));
      
      await expect(
        productRegistry.connect(manufacturer).registerProduct(
          newProductId,
          "Product After Revocation",
          manufacturer.address
        )
      ).to.be.revertedWithCustomError(productRegistry, "NotVerifiedManufacturer");
      
      // Re-verify for subsequent tests
      const verifyTx = await verificationSystem.connect(admin).verifyParticipant(manufacturer.address, MANUFACTURER_ROLE);
      console.log(`Re-verification tx hash: ${verifyTx.hash}`);
      await verifyTx.wait();
    });
    
    it("Should block milestone addition after supplier verification is revoked", async function() {
      // Add a milestone first
      const timestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      const milestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        revokedProductId,
        "Manufactured",
        "Initial milestone before revocation",
        timestamp
      );
      console.log(`Initial milestone tx hash: ${milestoneTx.hash}`);
      await milestoneTx.wait();
      
      // Revoke supplier verification
      const revokeTx = await verificationSystem.connect(admin).revokeVerification(supplier.address);
      console.log(`Supplier revocation tx hash: ${revokeTx.hash}`);
      await revokeTx.wait();
      
      // Try to add another milestone
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          revokedProductId,
          "Packaged",
          "After revocation milestone",
          timestamp - 1800
        )
      ).to.be.revertedWithCustomError(supplyChainTracker, "NotVerifiedSupplier");
      
      // Re-verify for subsequent tests
      const verifyTx = await verificationSystem.connect(admin).verifyParticipant(supplier.address, SUPPLIER_ROLE);
      console.log(`Re-verification tx hash: ${verifyTx.hash}`);
      await verifyTx.wait();
    });
    
    it("Should still allow consumers to query products after role revocations", async function() {
      // Add a milestone
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      const milestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        revokedProductId,
        "Manufactured",
        "Another milestone",
        timestamp
      );
      await milestoneTx.wait();
      
      // Revoke both roles
      await (await verificationSystem.connect(admin).revokeVerification(manufacturer.address)).wait();
      await (await verificationSystem.connect(admin).revokeVerification(supplier.address)).wait();
      
      // Consumer should still be able to query data
      const productDetails = await consumerInterface.connect(consumer).getProductDetails(revokedProductId);
      expect(productDetails[0]).to.equal(revokedProductId);
      
      const milestones = await consumerInterface.connect(consumer).getProductMilestones(revokedProductId);
      expect(milestones.length).to.be.greaterThan(0);
    });
  });
  
  // Error handling tests
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
    });

    it("Should reject invalid milestone data", async function() {
      // Try to add milestone with future timestamp
      const futureTimestamp = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future
      
      await expect(
        supplyChainTracker.connect(supplier).addMilestone(
          productId,
          "Shipped",
          "Details",
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
  
  // Event monitoring using AvalancheJS
  describe("Event Monitoring with AvalancheJS", function() {
    it("Should monitor ParticipantVerified events", async function() {
      // Create a new test wallet for event monitoring
      const testWallet = ethers.Wallet.createRandom().connect(provider);
      console.log(`Created test wallet: ${testWallet.address}`);
      
      // Setup event listener
      const verificationSystemContract = new Contract(
        contractAddresses.VerificationSystem,
        VerificationSystemABI.abi,
        provider
      );
      
      // Create a promise that resolves when event is detected
      const eventPromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout waiting for ParticipantVerified event"));
        }, 60000); // 1 minute timeout
        
        verificationSystemContract.on("ParticipantVerified", (participantAddress, role) => {
          try {
            if (participantAddress.toLowerCase() === testWallet.address.toLowerCase()) {
              console.log(`Detected ParticipantVerified event for ${participantAddress}`);
              expect(role).to.equal(MANUFACTURER_ROLE);
              clearTimeout(timeoutId);
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      // Verify the test wallet
      const tx = await verificationSystem.connect(admin).verifyParticipant(
        testWallet.address, 
        MANUFACTURER_ROLE
      );
      console.log(`Verification tx hash: ${tx.hash}`);
      await tx.wait();
      
      // Wait for event
      await eventPromise;
      
      // Remove event listener
      verificationSystemContract.removeAllListeners("ParticipantVerified");
    });
    
    it("Should monitor ProductRegistered events", async function() {
      // Create a new product ID
      const eventProductId = keccak256(toUtf8Bytes(`EventProduct-${Date.now()}`));
      
      // Setup event listener
      const productRegistryContract = new Contract(
        contractAddresses.ProductRegistry,
        ProductRegistryABI.abi,
        provider
      );
      
      // Create a promise that resolves when event is detected
      const eventPromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout waiting for ProductRegistered event"));
        }, 60000); // 1 minute timeout
        
        productRegistryContract.on("ProductRegistered", (emittedProductId, manufacturerAddress) => {
          try {
            if (emittedProductId === eventProductId) {
              console.log(`Detected ProductRegistered event for product ${emittedProductId}`);
              expect(manufacturerAddress).to.equal(manufacturer.address);
              clearTimeout(timeoutId);
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      // Register the product
      const tx = await productRegistry.connect(manufacturer).registerProduct(
        eventProductId,
        "Event Test Product",
        manufacturer.address
      );
      console.log(`Product registration tx hash: ${tx.hash}`);
      await tx.wait();
      
      // Wait for event
      await eventPromise;
      
      // Remove event listener
      productRegistryContract.removeAllListeners("ProductRegistered");
    });
    
    it("Should monitor MilestoneAdded events", async function() {
      // Use the product ID from the previous test
      const eventProductId = keccak256(toUtf8Bytes(`MilestoneEvent-${Date.now()}`));
      
      // Register product first
      const registerTx = await productRegistry.connect(manufacturer).registerProduct(
        eventProductId,
        "Milestone Event Test",
        manufacturer.address
      );
      await registerTx.wait();
      
      // Setup event listener
      const supplyChainTrackerContract = new Contract(
        contractAddresses.SupplyChainTracker,
        SupplyChainTrackerABI.abi,
        provider
      );
      
      // Create a promise that resolves when event is detected
      const eventPromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout waiting for MilestoneAdded event"));
        }, 60000); // 1 minute timeout
        
        supplyChainTrackerContract.on("MilestoneAdded", (emittedProductId, milestoneIndex, supplierAddress) => {
          try {
            if (emittedProductId === eventProductId && milestoneIndex.toString() === "0") {
              console.log(`Detected MilestoneAdded event for product ${emittedProductId}, index ${milestoneIndex}`);
              expect(supplierAddress).to.equal(supplier.address);
              clearTimeout(timeoutId);
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      // Add a milestone
      const timestamp = Math.floor(Date.now() / 1000) - 3600;
      const milestoneTx = await supplyChainTracker.connect(supplier).addMilestone(
        eventProductId,
        "Event Test Milestone",
        "Testing event monitoring",
        timestamp
      );
      console.log(`Milestone addition tx hash: ${milestoneTx.hash}`);
      await milestoneTx.wait();
      
      // Wait for event
      await eventPromise;
      
      // Remove event listener
      supplyChainTrackerContract.removeAllListeners("MilestoneAdded");
    });
    
    it("Should monitor VerificationRevoked events", async function() {
      // Create a new test wallet for event monitoring
      const testWallet = ethers.Wallet.createRandom().connect(provider);
      console.log(`Created test wallet for revocation: ${testWallet.address}`);
      
      // Verify the test wallet first
      const verifyTx = await verificationSystem.connect(admin).verifyParticipant(
        testWallet.address, 
        SUPPLIER_ROLE
      );
      await verifyTx.wait();
      
      // Setup event listener
      const verificationSystemContract = new Contract(
        contractAddresses.VerificationSystem,
        VerificationSystemABI.abi,
        provider
      );
      
      // Create a promise that resolves when event is detected
      const eventPromise = new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout waiting for VerificationRevoked event"));
        }, 60000); // 1 minute timeout
        
        verificationSystemContract.on("VerificationRevoked", (participantAddress) => {
          try {
            if (participantAddress.toLowerCase() === testWallet.address.toLowerCase()) {
              console.log(`Detected VerificationRevoked event for ${participantAddress}`);
              clearTimeout(timeoutId);
              resolve();
            }
          } catch (error) {
            reject(error);
          }
        });
      });
      
      // Revoke verification
      const revokeTx = await verificationSystem.connect(admin).revokeVerification(testWallet.address);
      console.log(`Revocation tx hash: ${revokeTx.hash}`);
      await revokeTx.wait();
      
      // Wait for event
      await eventPromise;
      
      // Remove event listener
      verificationSystemContract.removeAllListeners("VerificationRevoked");
    });
  });
});
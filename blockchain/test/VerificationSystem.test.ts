import { expect } from "chai";
import { ethers } from "hardhat";
import { VerificationSystem } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VerificationSystem", function () {
  let verificationSystem: VerificationSystem;
  let admin: SignerWithAddress;
  let nonAdmin: SignerWithAddress;
  let participant1: SignerWithAddress;
  let participant2: SignerWithAddress;
  let ADMIN_ROLE: string;
  let MANUFACTURER_ROLE: string;
  let SUPPLIER_ROLE: string;
  
  beforeEach(async function () {
    // Get signers
    [admin, nonAdmin, participant1, participant2] = await ethers.getSigners();
    
    // Deploy the contract
    const VerificationSystemFactory = await ethers.getContractFactory("VerificationSystem");
    verificationSystem = await VerificationSystemFactory.connect(admin).deploy();
    
    // Get role constants
    ADMIN_ROLE = await verificationSystem.ADMIN_ROLE();
    MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
    SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
  });
  
  describe("Deployment", function () {
    it("Should assign the admin role to the deployer", async function () {
      expect(await verificationSystem.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    });
    
    it("Should set ADMIN_ROLE as the admin of other roles", async function () {
      const manufacturerAdmin = await verificationSystem.getRoleAdmin(MANUFACTURER_ROLE);
      const supplierAdmin = await verificationSystem.getRoleAdmin(SUPPLIER_ROLE);
      
      expect(manufacturerAdmin).to.equal(ADMIN_ROLE);
      expect(supplierAdmin).to.equal(ADMIN_ROLE);
    });
    
    it("Should return the correct assignable roles", async function () {
      const [manufacturerRole, supplierRole] = await verificationSystem.getAssignableRoles();
      expect(manufacturerRole).to.equal(MANUFACTURER_ROLE);
      expect(supplierRole).to.equal(SUPPLIER_ROLE);
    });
  });
  
  describe("Participant Verification", function () {
    it("Should verify a participant as a manufacturer", async function () {
      const tx = await verificationSystem.verifyParticipant(participant1.address, MANUFACTURER_ROLE);
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(verificationSystem, "ParticipantVerified")
        .withArgs(participant1.address, MANUFACTURER_ROLE);
      
      // Check that the role was granted
      expect(await verificationSystem.hasRole(MANUFACTURER_ROLE, participant1.address)).to.equal(true);
      
      // Check the participant status
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(MANUFACTURER_ROLE);
      expect(isVerified).to.equal(true);
      expect(verifiedAt).to.be.gt(0);
      
      // Check the isVerifiedForRole helper
      expect(await verificationSystem.isVerifiedForRole(participant1.address, MANUFACTURER_ROLE)).to.equal(true);
      expect(await verificationSystem.isVerifiedForRole(participant1.address, SUPPLIER_ROLE)).to.equal(false);
    });
    
    it("Should verify a participant as a supplier", async function () {
      const tx = await verificationSystem.verifyParticipant(participant1.address, SUPPLIER_ROLE);
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(verificationSystem, "ParticipantVerified")
        .withArgs(participant1.address, SUPPLIER_ROLE);
      
      // Check that the role was granted
      expect(await verificationSystem.hasRole(SUPPLIER_ROLE, participant1.address)).to.equal(true);
      
      // Check the participant status
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(SUPPLIER_ROLE);
      expect(isVerified).to.equal(true);
      expect(verifiedAt).to.be.gt(0);
    });
    
    it("Should revert when non-admin tries to verify a participant", async function () {
      await expect(
        verificationSystem.connect(nonAdmin).verifyParticipant(participant1.address, MANUFACTURER_ROLE)
      ).to.be.revertedWithCustomError(
        verificationSystem, 
        "AccessControlUnauthorizedAccount"
      );
    });
    
    it("Should revert when verifying with invalid role", async function () {
      const INVALID_ROLE = ethers.keccak256(ethers.toUtf8Bytes("INVALID_ROLE"));
      
      await expect(
        verificationSystem.verifyParticipant(participant1.address, INVALID_ROLE)
      ).to.be.revertedWithCustomError(verificationSystem, "InvalidRole");
    });
    
    it("Should revert when verifying with zero address", async function () {
      await expect(
        verificationSystem.verifyParticipant(ethers.ZeroAddress, MANUFACTURER_ROLE)
      ).to.be.revertedWithCustomError(verificationSystem, "InvalidParticipant");
    });
    
    it("Should revert when verifying already verified participant", async function () {
      // Verify the participant first
      await verificationSystem.verifyParticipant(participant1.address, MANUFACTURER_ROLE);
      
      // Try to verify them again
      await expect(
        verificationSystem.verifyParticipant(participant1.address, SUPPLIER_ROLE)
      ).to.be.revertedWithCustomError(verificationSystem, "AlreadyVerified");
    });
  });
  
  describe("Verification Revocation", function () {
    beforeEach(async function () {
      // Verify participant1 as a manufacturer
      await verificationSystem.verifyParticipant(participant1.address, MANUFACTURER_ROLE);
    });
    
    it("Should revoke verification from a participant", async function () {
      const tx = await verificationSystem.revokeVerification(participant1.address);
      
      // Check that the event was emitted
      await expect(tx)
        .to.emit(verificationSystem, "VerificationRevoked")
        .withArgs(participant1.address);
      
      // Check that the role was revoked
      expect(await verificationSystem.hasRole(MANUFACTURER_ROLE, participant1.address)).to.equal(false);
      
      // Check the participant status
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(MANUFACTURER_ROLE); // role is preserved but verification is false
      expect(isVerified).to.equal(false);
      expect(verifiedAt).to.be.gt(0); // verifiedAt is preserved
      
      // Check the isVerifiedForRole helper
      expect(await verificationSystem.isVerifiedForRole(participant1.address, MANUFACTURER_ROLE)).to.equal(false);
    });
    
    it("Should revert when non-admin tries to revoke verification", async function () {
      await expect(
        verificationSystem.connect(nonAdmin).revokeVerification(participant1.address)
      ).to.be.revertedWithCustomError(
        verificationSystem, 
        "AccessControlUnauthorizedAccount"
      );
    });
    
    it("Should revert when revoking verification from non-verified participant", async function () {
      await expect(
        verificationSystem.revokeVerification(participant2.address)
      ).to.be.revertedWithCustomError(verificationSystem, "NotVerified");
    });
    
    it("Should revert when revoking verification with zero address", async function () {
      await expect(
        verificationSystem.revokeVerification(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(verificationSystem, "InvalidParticipant");
    });
    
    it("Should allow re-verification after revocation", async function () {
      // Revoke verification
      await verificationSystem.revokeVerification(participant1.address);
      
      // Verify as supplier now
      await verificationSystem.verifyParticipant(participant1.address, SUPPLIER_ROLE);
      
      // Check the participant status
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(SUPPLIER_ROLE);
      expect(isVerified).to.equal(true);
      expect(await verificationSystem.hasRole(SUPPLIER_ROLE, participant1.address)).to.equal(true);
    });
  });
  
  describe("Participant Status Query", function () {
    it("Should return default values for non-verified participants", async function () {
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(ethers.ZeroHash);
      expect(isVerified).to.equal(false);
      expect(verifiedAt).to.equal(0);
    });
    
    it("Should return correct values for verified participants", async function () {
      // Verify the participant
      const tx = await verificationSystem.verifyParticipant(participant1.address, MANUFACTURER_ROLE);
      const receipt = await tx.wait();
      const blockTime = (await ethers.provider.getBlock(receipt!.blockNumber!))!.timestamp;
      
      // Check the participant status
      const [role, isVerified, verifiedAt] = await verificationSystem.getParticipantStatus(participant1.address);
      expect(role).to.equal(MANUFACTURER_ROLE);
      expect(isVerified).to.equal(true);
      expect(verifiedAt).to.equal(blockTime);
    });
  });
});
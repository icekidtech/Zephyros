import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Deploying SupplyChainTracker contract...");
  
  let productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  let verificationSystemAddress = process.env.VERIFICATION_SYSTEM_ADDRESS;
  
  if (!productRegistryAddress || !verificationSystemAddress) {
    // Try to read from deployed-addresses.json
    const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
    if (fs.existsSync(addressesPath)) {
      const addressesData = fs.readFileSync(addressesPath, 'utf8');
      const addresses = JSON.parse(addressesData);
      productRegistryAddress = productRegistryAddress || addresses.ProductRegistry;
      verificationSystemAddress = verificationSystemAddress || addresses.VerificationSystem;
    }
  }
  
  if (!productRegistryAddress || !verificationSystemAddress) {
    console.log("Missing required addresses. Please deploy prerequisite contracts first or set environment variables.");
    if (!productRegistryAddress) console.log("Missing: PRODUCT_REGISTRY_ADDRESS");
    if (!verificationSystemAddress) console.log("Missing: VERIFICATION_SYSTEM_ADDRESS");
    process.exit(1);
  }
  
  const SupplyChainTracker = await ethers.getContractFactory("SupplyChainTracker");
  const supplyChainTracker = await SupplyChainTracker.deploy(productRegistryAddress, verificationSystemAddress);
  
  await supplyChainTracker.waitForDeployment();
  const address = await supplyChainTracker.getAddress();
  
  console.log(`SupplyChainTracker deployed to: ${address}`);
  console.log(`Using ProductRegistry at: ${productRegistryAddress}`);
  console.log(`Using VerificationSystem at: ${verificationSystemAddress}`);
  console.log("Deploy transaction hash:", supplyChainTracker.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await supplyChainTracker.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  // Save address to deployed-addresses.json
  let addresses: Record<string, string> = {};
  const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
  
  if (fs.existsSync(addressesPath)) {
    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    addresses = JSON.parse(addressesData);
  }
  
  addresses.SupplyChainTracker = address;
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log(`Address saved to ${addressesPath}`);
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${supplyChainTracker.deploymentTransaction()?.hash}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("Verify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address} ${productRegistryAddress} ${verificationSystemAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
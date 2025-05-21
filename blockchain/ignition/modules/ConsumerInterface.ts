import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Deploying ConsumerInterface contract...");
  
  let productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  let supplyChainTrackerAddress = process.env.SUPPLY_CHAIN_TRACKER_ADDRESS;
  
  if (!productRegistryAddress || !supplyChainTrackerAddress) {
    // Try to read from deployed-addresses.json
    const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
    if (fs.existsSync(addressesPath)) {
      const addressesData = fs.readFileSync(addressesPath, 'utf8');
      const addresses = JSON.parse(addressesData);
      productRegistryAddress = productRegistryAddress || addresses.ProductRegistry;
      supplyChainTrackerAddress = supplyChainTrackerAddress || addresses.SupplyChainTracker;
    }
  }
  
  if (!productRegistryAddress || !supplyChainTrackerAddress) {
    console.log("Missing required addresses. Please deploy prerequisite contracts first or set environment variables.");
    if (!productRegistryAddress) console.log("Missing: PRODUCT_REGISTRY_ADDRESS");
    if (!supplyChainTrackerAddress) console.log("Missing: SUPPLY_CHAIN_TRACKER_ADDRESS");
    process.exit(1);
  }
  
  const ConsumerInterface = await ethers.getContractFactory("ConsumerInterface");
  const consumerInterface = await ConsumerInterface.deploy(productRegistryAddress, supplyChainTrackerAddress);
  
  await consumerInterface.waitForDeployment();
  const address = await consumerInterface.getAddress();
  
  console.log(`ConsumerInterface deployed to: ${address}`);
  console.log(`Using ProductRegistry at: ${productRegistryAddress}`);
  console.log(`Using SupplyChainTracker at: ${supplyChainTrackerAddress}`);
  console.log("Deploy transaction hash:", consumerInterface.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await consumerInterface.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  // Save address to deployed-addresses.json
  let addresses: { ConsumerInterface?: string; ProductRegistry?: string; SupplyChainTracker?: string } = {};
  const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
  
  if (fs.existsSync(addressesPath)) {
    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    addresses = JSON.parse(addressesData);
  }
  
  addresses.ConsumerInterface = address;
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log(`Address saved to ${addressesPath}`);
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${consumerInterface.deploymentTransaction()?.hash}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("Verify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address} ${productRegistryAddress} ${supplyChainTrackerAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
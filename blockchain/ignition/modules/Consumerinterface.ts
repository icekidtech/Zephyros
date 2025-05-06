import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ConsumerInterface contract...");
  
  // Get deployed contract addresses
  const productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  const supplyChainTrackerAddress = process.env.SUPPLY_CHAIN_TRACKER_ADDRESS;
  
  if (!productRegistryAddress || !supplyChainTrackerAddress) {
    console.error("ProductRegistry and/or SupplyChainTracker addresses not found in environment variables");
    process.exit(1);
  }
  
  const ConsumerInterface = await ethers.getContractFactory("ConsumerInterface");
  const consumerInterface = await ConsumerInterface.deploy(
    productRegistryAddress, 
    supplyChainTrackerAddress
  );
  
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
  
  console.log("Deployment completed successfully!");
  
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
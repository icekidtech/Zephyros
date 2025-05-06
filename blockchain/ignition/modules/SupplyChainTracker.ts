import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment process...");
  
  // 1. Get the ProductRegistry address
  const productRegistryAddress = process.env.PRODUCT_REGISTRY_ADDRESS;
  
  if (!productRegistryAddress) {
    console.log("No ProductRegistry address found in environment variables.");
    console.log("Deploying a new ProductRegistry contract first...");
    
    // Deploy ProductRegistry
    const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy();
    await productRegistry.waitForDeployment();
    const deployedProductRegistryAddress = await productRegistry.getAddress();
    
    console.log(`ProductRegistry deployed to: ${deployedProductRegistryAddress}`);
    
    // Now deploy SupplyChainTracker with the new ProductRegistry address
    await deploySupplyChainTracker(deployedProductRegistryAddress);
  } else {
    console.log(`Using existing ProductRegistry at: ${productRegistryAddress}`);
    
    // Deploy SupplyChainTracker with the provided ProductRegistry address
    await deploySupplyChainTracker(productRegistryAddress);
  }
}

async function deploySupplyChainTracker(productRegistryAddress: string) {
  console.log("Deploying SupplyChainTracker contract...");
  
  const SupplyChainTracker = await ethers.getContractFactory("SupplyChainTracker");
  const supplyChainTracker = await SupplyChainTracker.deploy(productRegistryAddress);
  
  await supplyChainTracker.waitForDeployment();
  const address = await supplyChainTracker.getAddress();
  
  console.log(`SupplyChainTracker deployed to: ${address}`);
  console.log(`Using ProductRegistry at: ${productRegistryAddress}`);
  console.log("Deploy transaction hash:", supplyChainTracker.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await supplyChainTracker.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  console.log("Deployment completed successfully!");
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${supplyChainTracker.deploymentTransaction()?.hash}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("Verify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address} ${productRegistryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
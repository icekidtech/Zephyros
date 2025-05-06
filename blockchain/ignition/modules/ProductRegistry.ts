import { ethers } from "hardhat";

async function main() {
  console.log("Deploying ProductRegistry contract...");
  
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy();
  
  await productRegistry.waitForDeployment();
  const address = await productRegistry.getAddress();
  
  console.log(`ProductRegistry deployed to: ${address}`);
  console.log("Deploy transaction hash:", productRegistry.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await productRegistry.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  console.log("Deployment completed successfully!");
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${productRegistry.deploymentTransaction()?.hash}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("Verify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
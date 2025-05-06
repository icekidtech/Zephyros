import { ethers } from "hardhat";

async function main() {
  console.log("Deploying VerificationSystem contract...");
  
  const VerificationSystem = await ethers.getContractFactory("VerificationSystem");
  const verificationSystem = await VerificationSystem.deploy();
  
  await verificationSystem.waitForDeployment();
  const address = await verificationSystem.getAddress();
  
  console.log(`VerificationSystem deployed to: ${address}`);
  console.log("Deploy transaction hash:", verificationSystem.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await verificationSystem.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  // Log role hashes for reference
  const ADMIN_ROLE = await verificationSystem.ADMIN_ROLE();
  const MANUFACTURER_ROLE = await verificationSystem.MANUFACTURER_ROLE();
  const SUPPLIER_ROLE = await verificationSystem.SUPPLIER_ROLE();
  
  console.log(`ADMIN_ROLE: ${ADMIN_ROLE}`);
  console.log(`MANUFACTURER_ROLE: ${MANUFACTURER_ROLE}`);
  console.log(`SUPPLIER_ROLE: ${SUPPLIER_ROLE}`);
  
  console.log("Deployment completed successfully!");
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${verificationSystem.deploymentTransaction()?.hash}`);
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
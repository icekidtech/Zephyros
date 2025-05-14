import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

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
  
  // Save address to deployed-addresses.json
  let addresses: { VerificationSystem?: string } = {};
  const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
  
  if (fs.existsSync(addressesPath)) {
    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    addresses = JSON.parse(addressesData);
  }
  
  addresses.VerificationSystem = address;
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log(`Address saved to ${addressesPath}`);
  
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
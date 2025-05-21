import { ethers } from "hardhat";
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Deploying ProductRegistry contract...");
  
  let verificationSystemAddress = process.env.VERIFICATION_SYSTEM_ADDRESS;
  
  if (!verificationSystemAddress) {
    // Try to read from deployed-addresses.json
    const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
    if (fs.existsSync(addressesPath)) {
      const addressesData = fs.readFileSync(addressesPath, 'utf8');
      const addresses = JSON.parse(addressesData);
      verificationSystemAddress = addresses.VerificationSystem;
    }
  }
  
  if (!verificationSystemAddress) {
    console.log("No VerificationSystem address found in environment or deployed-addresses.json");
    console.log("Please deploy VerificationSystem first or set the VERIFICATION_SYSTEM_ADDRESS environment variable.");
    process.exit(1);
  }
  
  const ProductRegistry = await ethers.getContractFactory("ProductRegistry");
  const productRegistry = await ProductRegistry.deploy(verificationSystemAddress);
  
  await productRegistry.waitForDeployment();
  const address = await productRegistry.getAddress();
  
  console.log(`ProductRegistry deployed to: ${address}`);
  console.log(`Using VerificationSystem at: ${verificationSystemAddress}`);
  console.log("Deploy transaction hash:", productRegistry.deploymentTransaction()?.hash);
  
  // Wait for 5 confirmations for better reliability
  console.log("Waiting for 5 confirmations...");
  await productRegistry.deploymentTransaction()?.wait(5);
  console.log("Confirmed!");
  
  // Save address to deployed-addresses.json
  let addresses: { ProductRegistry?: string; VerificationSystem?: string } = {};
  const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
  
  if (fs.existsSync(addressesPath)) {
    const addressesData = fs.readFileSync(addressesPath, 'utf8');
    addresses = JSON.parse(addressesData);
  }
  
  addresses.ProductRegistry = address;
  
  fs.writeFileSync(addressesPath, JSON.stringify(addresses, null, 2));
  
  console.log(`Address saved to ${addressesPath}`);
  
  // Log information useful for verification
  console.log("\nContract verification info:");
  console.log("-----------------------------");
  console.log(`Contract address: ${address}`);
  console.log(`Deployment transaction hash: ${productRegistry.deploymentTransaction()?.hash}`);
  console.log(`Network: ${(await ethers.provider.getNetwork()).name}`);
  console.log("Verify with:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${address} ${verificationSystemAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
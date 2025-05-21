import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

async function main() {
  console.log("Starting deployment of all Zephyros contracts...");
  
  // Determine which network to use
  const network = process.env.HARDHAT_NETWORK || 'fuji';
  
  try {
    // Deploy VerificationSystem
    console.log("\n============ Deploying VerificationSystem ============");
    await execAsync(`npx hardhat run ignition/modules/VerificationSystem.ts --network ${network}`);
    
    // Deploy ProductRegistry
    console.log("\n============ Deploying ProductRegistry ============");
    await execAsync(`npx hardhat run ignition/modules/ProductRegistry.ts --network ${network}`);
    
    // Deploy SupplyChainTracker
    console.log("\n============ Deploying SupplyChainTracker ============");
    await execAsync(`npx hardhat run ignition/modules/SupplyChainTracker.ts --network ${network}`);
    
    // Deploy ConsumerInterface
    console.log("\n============ Deploying ConsumerInterface ============");
    await execAsync(`npx hardhat run ignition/modules/ConsumerInterface.ts --network ${network}`);
    
    // Display all deployed addresses
    const addressesPath = path.join(__dirname, '../../deployed-addresses.json');
    if (fs.existsSync(addressesPath)) {
      const addressesData = fs.readFileSync(addressesPath, 'utf8');
      const addresses = JSON.parse(addressesData);
      
      console.log("\n============ Deployment Summary ============");
      console.log("All contracts deployed successfully!");
      console.log("Deployed addresses:");
      console.log(addresses);
      console.log(`Addresses saved to: ${addressesPath}`);
      console.log("\nYou can now verify the contracts on Snowtrace using the verification commands printed above.");
    } else {
      console.log("Could not find deployed-addresses.json. This is unexpected.");
    }
  } catch (error) {
    console.error("Error during deployment:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
import { Avalanche } from "@avalabs/avalanchejs";
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function monitorProductRegisteredEvents() {
  console.log("Starting to monitor ProductRegistered events on Fuji testnet...");

  // Connect to Avalanche network - Fuji testnet
  const avalanche = new Avalanche("api.avax-test.network", 443, "https", 43113);
  const cChain = avalanche.getCChain();
  
  // Get contract ABI
  const contractPath = path.join(__dirname, "../artifacts/contracts/ProductRegistry.sol/ProductRegistry.json");
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const contractAbi = contractJson.abi;
  
  // Set up Ethers provider and contract instance
  const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
  
  // Replace with your deployed contract address
  const contractAddress = process.env.CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("CONTRACT_ADDRESS environment variable not set");
  }
  
  const productRegistry = new ethers.Contract(contractAddress, contractAbi, provider);
  
  console.log(`Monitoring events for ProductRegistry at ${contractAddress}`);
  
  // Listen for ProductRegistered events
  productRegistry.on("ProductRegistered", (productId, manufacturer, event) => {
    console.log("Product Registered Event Detected!");
    console.log(`Product ID: ${productId}`);
    console.log(`Manufacturer: ${manufacturer}`);
    console.log(`Block Number: ${event.log.blockNumber}`);
    console.log(`Transaction Hash: ${event.log.transactionHash}`);
    console.log("------------------------------------------");
  });
  
  console.log("Event listener set up successfully. Waiting for events...");
}

// Run the function
monitorProductRegisteredEvents()
  .catch((error) => {
    console.error("Error monitoring events:", error);
    process.exit(1);
  });
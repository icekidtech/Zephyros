const { Avalanche } = require("@avalabs/avalanchejs");
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function monitorMilestoneAddedEvents() {
  console.log("Starting to monitor MilestoneAdded events on Fuji testnet...");

  // Connect to Avalanche network - Fuji testnet
  const avalanche = new Avalanche("api.avax-test.network", 443, "https", 43113);
  const cChain = avalanche.getCChain();
  
  // Get contract ABI
  const contractPath = path.join(__dirname, "../artifacts/contracts/SupplyChainTracker.sol/SupplyChainTracker.json");
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const contractAbi = contractJson.abi;
  
  // Set up Ethers provider and contract instance
  const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
  
  // Replace with your deployed contract address
  const contractAddress = process.env.SUPPLY_CHAIN_TRACKER_ADDRESS;
  if (!contractAddress) {
    throw new Error("SUPPLY_CHAIN_TRACKER_ADDRESS environment variable not set");
  }
  
  const supplyChainTracker = new ethers.Contract(contractAddress, contractAbi, provider);
  
  console.log(`Monitoring events for SupplyChainTracker at ${contractAddress}`);
  
  // Listen for MilestoneAdded events
  supplyChainTracker.on("MilestoneAdded", (productId, milestoneIndex, participant, event) => {
    console.log("Milestone Added Event Detected!");
    console.log(`Product ID: ${productId}`);
    console.log(`Milestone Index: ${milestoneIndex}`);
    console.log(`Participant: ${participant}`);
    console.log(`Block Number: ${event.log.blockNumber}`);
    console.log(`Transaction Hash: ${event.log.transactionHash}`);
    console.log("------------------------------------------");
  });
  
  console.log("Event listener set up successfully. Waiting for events...");
}

// Run the function
monitorMilestoneAddedEvents()
  .catch((error) => {
    console.error("Error monitoring events:", error);
    process.exit(1);
  });
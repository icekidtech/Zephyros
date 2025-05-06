const { Avalanche } = require("@avalabs/avalanchejs");
import { ethers } from "ethers";
import fs from "fs";
import path from "path";

async function monitorVerificationEvents() {
  console.log("Starting to monitor VerificationSystem events on Fuji testnet...");

  // Connect to Avalanche network - Fuji testnet
  const avalanche = new Avalanche("api.avax-test.network", 443, "https", 43113);
  const cChain = avalanche.getCChain();
  
  // Get contract ABI
  const contractPath = path.join(__dirname, "../artifacts/contracts/VerificationSystem.sol/VerificationSystem.json");
  const contractJson = JSON.parse(fs.readFileSync(contractPath, "utf8"));
  const contractAbi = contractJson.abi;
  
  // Set up Ethers provider and contract instance
  const provider = new ethers.JsonRpcProvider("https://api.avax-test.network/ext/bc/C/rpc");
  
  // Replace with your deployed contract address
  const contractAddress = process.env.VERIFICATION_SYSTEM_ADDRESS;
  if (!contractAddress) {
    throw new Error("VERIFICATION_SYSTEM_ADDRESS environment variable not set");
  }
  
  const verificationSystem = new ethers.Contract(contractAddress, contractAbi, provider);
  
  console.log(`Monitoring events for VerificationSystem at ${contractAddress}`);
  
  // Listen for ParticipantVerified events
  verificationSystem.on("ParticipantVerified", (participant, role, event) => {
    console.log("Participant Verified Event Detected!");
    console.log(`Participant: ${participant}`);
    console.log(`Role: ${role}`);
    console.log(`Block Number: ${event.log.blockNumber}`);
    console.log(`Transaction Hash: ${event.log.transactionHash}`);
    console.log("------------------------------------------");
  });
  
  // Listen for VerificationRevoked events
  verificationSystem.on("VerificationRevoked", (participant, event) => {
    console.log("Verification Revoked Event Detected!");
    console.log(`Participant: ${participant}`);
    console.log(`Block Number: ${event.log.blockNumber}`);
    console.log(`Transaction Hash: ${event.log.transactionHash}`);
    console.log("------------------------------------------");
  });
  
  console.log("Event listener set up successfully. Waiting for events...");
}

// Run the function
monitorVerificationEvents()
  .catch((error) => {
    console.error("Error monitoring events:", error);
    process.exit(1);
  });
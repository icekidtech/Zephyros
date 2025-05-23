import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ignition";
import dotenv from "dotenv";

dotenv.config();

// Get private key from environment variable or use a default (DO NOT USE THIS DEFAULT IN PRODUCTION)
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const FUJI_RPC_URL = process.env.FUJI_RPC_URL || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Local development
    hardhat: {
      chainId: 31337,
    },
    // Avalanche Fuji Testnet
    fuji: {
      url: FUJI_RPC_URL,
      chainId: 43113,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      gasPrice: "auto",
    },
  },
  // Enable gas reporting for optimization purposes
  gasReporter: {
    enabled: process.env.REPORT_GAS ? true : false,
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "AVAX",
  },
  // Add etherscan configuration for contract verification
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: ETHERSCAN_API_KEY
    }
  },
  // Enable sourcify verification
  sourcify: {
    enabled: true
  }
};

export default config;

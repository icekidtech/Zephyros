import axios from 'axios';
import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// API constants
const SNOWTRACE_API_URL = 'https://api-testnet.snowtrace.io/api';
const SNOWTRACE_API_KEY = process.env.SNOWTRACE_API_KEY;
const SOLIDITY_VERSION = '0.8.28'; // Match your hardhat.config.ts version
const LICENSE_TYPE = '3'; // MIT License

// Read deployed addresses
const addressesPath = path.join(__dirname, '../deployed-addresses.json');
const deployedAddresses = JSON.parse(fs.readFileSync(addressesPath, 'utf8'));

// Function to flatten a contract
async function flattenContract(contractName: string) {
  console.log(`Flattening ${contractName}...`);
  
  // Ensure flattened directory exists
  const flattenedDir = path.join(__dirname, '../flattened');
  if (!fs.existsSync(flattenedDir)) {
    fs.mkdirSync(flattenedDir);
  }
  
  const contractPath = path.join(__dirname, `../contracts/${contractName}.sol`);
  const outputPath = path.join(flattenedDir, `${contractName}.sol`);
  
  try {
    // Execute the flatten command
    const flattenedCode = execSync(`npx hardhat flatten ${contractPath}`).toString();
    
    // Remove duplicate SPDX license identifiers
    let cleanCode = '// SPDX-License-Identifier: MIT\n';
    cleanCode += flattenedCode
      .replace(/\/\/ SPDX-License-Identifier: MIT\n/g, '')
      .replace(/pragma solidity \^\d+\.\d+\.\d+;/g, (match, index, original) => {
        // Keep only the first pragma statement
        if (original.indexOf('pragma solidity') === index) {
          return match;
        }
        return '';
      });
    
    // Write the cleaned code to file
    fs.writeFileSync(outputPath, cleanCode);
    console.log(`Flattened ${contractName} saved to ${outputPath}`);
    return fs.readFileSync(outputPath, 'utf8');
  } catch (error) {
    console.error(`Error flattening ${contractName}:`, error);
    throw error;
  }
}

// Function to encode constructor arguments
function encodeConstructorArgs(contract: string, args: any[]) {
  console.log(`Encoding constructor arguments for ${contract}...`);
  
  if (args.length === 0) {
    return '';
  }
  
  try {
    let types: string[] = [];
    
    // Determine argument types based on contract
    switch (contract) {
      case 'VerificationSystem':
        return ''; // No constructor arguments
        
      case 'ProductRegistry':
        types = ['address'];
        break;
        
      case 'SupplyChainTracker':
        types = ['address', 'address'];
        break;
        
      case 'ConsumerInterface':
        types = ['address', 'address'];
        break;
        
      default:
        throw new Error(`Unknown contract: ${contract}`);
    }
    
    // Encode the arguments
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, args).slice(2); // Remove '0x' prefix
    console.log(`Encoded arguments: ${encoded}`);
    return encoded;
  } catch (error) {
    console.error(`Error encoding constructor arguments for ${contract}:`, error);
    throw error;
  }
}

// Function to verify a contract
async function verifyContract(
  contractName: string, 
  contractAddress: string, 
  constructorArgs: any[]
) {
  console.log(`\n=== Verifying ${contractName} at ${contractAddress} ===`);
  
  try {
    // Flatten the contract source
    const sourceCode = await flattenContract(contractName);
    
    // Encode constructor arguments
    const encodedArgs = encodeConstructorArgs(contractName, constructorArgs);
    
    // Prepare API request parameters
    const verifyParams: any = {
      apikey: SNOWTRACE_API_KEY,
      module: 'contract',
      action: 'verifysourcecode',
      sourceCode: sourceCode,
      contractname: contractName,
      contractaddress: contractAddress,
      compilerversion: `v${SOLIDITY_VERSION}`,
      optimizationUsed: '1',
      runs: '200',
      licenseType: LICENSE_TYPE
    };
    
    // Add constructor arguments if provided
    if (encodedArgs) {
      verifyParams.constructorArguments = encodedArgs;
    }
    
    console.log('Submitting verification request to Snowtrace API...');
    
    // Submit verification request
    const response = await axios.post(SNOWTRACE_API_URL, null, {
      params: verifyParams
    });
    
    if (response.data.status === '1') {
      console.log(`${contractName} verification submitted successfully. GUID: ${response.data.result}`);
      
      // Check verification status
      await checkVerificationStatus(response.data.result, contractName, contractAddress);
    } else {
      console.error(`Error submitting ${contractName} verification: ${response.data.result}`);
    }
  } catch (error) {
    console.error(`Error verifying ${contractName}:`, error);
  }
}

// Function to check verification status
async function checkVerificationStatus(guid: string, contractName: string, contractAddress: string, attempts = 1) {
  if (attempts > 10) {
    console.log(`Maximum verification check attempts reached for ${contractName}. Please check manually on Snowtrace.`);
    return;
  }
  
  console.log(`Checking verification status for ${contractName} (attempt ${attempts})...`);
  
  // Wait before checking status (increase wait time with each attempt)
  const waitTime = 5000 * attempts;
  console.log(`Waiting ${waitTime / 1000} seconds...`);
  await new Promise(resolve => setTimeout(resolve, waitTime));
  
  try {
    const params = {
      apikey: SNOWTRACE_API_KEY,
      module: 'contract',
      action: 'checkverifystatus',
      guid: guid
    };
    
    const response = await axios.get(SNOWTRACE_API_URL, { params });
    
    if (response.data.status === '1') {
      console.log(`✅ ${contractName} verification SUCCESSFUL!`);
      console.log(`View on Snowtrace: https://testnet.snowtrace.io/address/${contractAddress}#code`);
    } else {
      console.log(`${contractName} verification status: ${response.data.result}`);
      
      // If still processing, check again after delay
      if (response.data.result.includes('Pending')) {
        await checkVerificationStatus(guid, contractName, contractAddress, attempts + 1);
      } else {
        console.error(`❌ ${contractName} verification FAILED: ${response.data.result}`);
      }
    }
  } catch (error) {
    console.error(`Error checking verification status for ${contractName}:`, error);
    
    // Try again after a delay
    await checkVerificationStatus(guid, contractName, contractAddress, attempts + 1);
  }
}

// Main function to verify all contracts
async function main() {
  console.log('Starting contract verification process...');
  
  if (!SNOWTRACE_API_KEY) {
    console.error('Error: SNOWTRACE_API_KEY not found in .env file');
    process.exit(1);
  }

  // Check if deployed-addresses.json exists
  if (!fs.existsSync(addressesPath)) {
    console.error('Error: deployed-addresses.json not found');
    process.exit(1);
  }

  // Check required addresses
  const requiredContracts = [
    'VerificationSystem',
    'ProductRegistry',
    'SupplyChainTracker',
    'ConsumerInterface'
  ];
  
  for (const contract of requiredContracts) {
    if (!deployedAddresses[contract]) {
      console.error(`Error: Missing ${contract} address in deployed-addresses.json`);
      process.exit(1);
    }
  }
  
  // Verify VerificationSystem (no constructor args)
  await verifyContract(
    'VerificationSystem',
    deployedAddresses.VerificationSystem,
    []
  );
  
  // Verify ProductRegistry (VerificationSystem address as arg)
  await verifyContract(
    'ProductRegistry',
    deployedAddresses.ProductRegistry,
    [deployedAddresses.VerificationSystem]
  );
  
  // Verify SupplyChainTracker (ProductRegistry and VerificationSystem addresses as args)
  await verifyContract(
    'SupplyChainTracker',
    deployedAddresses.SupplyChainTracker,
    [deployedAddresses.ProductRegistry, deployedAddresses.VerificationSystem]
  );
  
  // Verify ConsumerInterface (ProductRegistry and SupplyChainTracker addresses as args)
  await verifyContract(
    'ConsumerInterface',
    deployedAddresses.ConsumerInterface,
    [deployedAddresses.ProductRegistry, deployedAddresses.SupplyChainTracker]
  );
  
  console.log('\nAll contract verification processes initiated. Check logs for verification status.');
}

// Run the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
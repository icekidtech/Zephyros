import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  constructor(private configService: ConfigService) {
    // Connect to Avalanche C-Chain
    this.provider = new ethers.JsonRpcProvider('https://api.avax.network/ext/bc/C/rpc');
    
    // Initialize wallet with private key
    let privateKey = this.configService.get<string>('AVALANCHE_PRIVATE_KEY');
    
    // Check if private key is valid (not a placeholder and properly formatted)
    if (privateKey && 
        !privateKey.startsWith('0xyour_') && 
        privateKey.match(/^(0x)?[0-9a-fA-F]{64}$/)) {
      try {
        // If the key doesn't include 0x prefix, add it
        if (!privateKey.startsWith('0x')) {
          privateKey = `0x${privateKey}`;
        }
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        console.info('Blockchain wallet initialized successfully');
      } catch (error) {
        console.error('Failed to initialize blockchain wallet:', error.message);
      }
    } else {
      console.warn('No valid Avalanche private key provided. Blockchain transactions will be disabled.');
    }
  }

  async getTransactionCount(): Promise<number> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    return await this.provider.getTransactionCount(this.wallet.address);
  }

  async getBalance(): Promise<string> {
    if (!this.wallet) {
      throw new Error('Wallet not initialized');
    }
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  // Add more blockchain interaction methods as needed
}
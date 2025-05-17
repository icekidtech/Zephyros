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
    const privateKey = this.configService.get<string>('AVALANCHE_PRIVATE_KEY');
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
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
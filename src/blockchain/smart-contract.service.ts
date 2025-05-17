import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { BlockchainService } from './blockchain.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmartContractService {
  private contract: ethers.Contract;
  constructor(
    private readonly blockchainService: BlockchainService,
    private readonly configService: ConfigService,
  ) {
    // Contract ABI and address would typically be stored in a config file
    const contractABI = [
      "function recordMilestone(string productId, string milestone, uint256 timestamp)",
      "function getProductHistory(string productId) view returns (string[] memory)",
    ];
    
    const contractAddress = this.configService.get<string>('SMART_CONTRACT_ADDRESS');
    
    // Only initialize the contract if both the contract address and wallet are available
    if (contractAddress && this.blockchainService['wallet']) {
      try {
        // Initialize contract instance
        this.contract = new ethers.Contract(
          contractAddress,
          contractABI,
          this.blockchainService['wallet']
        );
        console.info('Smart contract initialized successfully');
      } catch (error) {
        console.error('Failed to initialize smart contract:', error.message);
      }
    } else {
      console.warn(
        'Smart contract not initialized. Missing ' +
        (!contractAddress ? 'contract address' : 'wallet initialization')
      );
    }
  }
  
  async recordMilestone(productId: string, milestone: string): Promise<ethers.TransactionResponse | null> {
    if (!this.contract) {
      console.warn('Cannot record milestone: Smart contract not initialized');
      return null;
    }
    
    try {
      return await this.contract.recordMilestone(
        productId,
        milestone,
        Math.floor(Date.now() / 1000)
      );
    } catch (error) {
      console.error(`Failed to record milestone for product ${productId}:`, error.message);
      throw new Error(`Blockchain transaction failed: ${error.message}`);
    }
  }

  async getProductHistory(productId: string): Promise<string[]> {
    if (!this.contract) {
      console.warn('Cannot get product history: Smart contract not initialized');
      return [];
    }
    
    try {
      return await this.contract.getProductHistory(productId);
    } catch (error) {
      console.error(`Failed to get product history for ${productId}:`, error.message);
      throw new Error(`Blockchain query failed: ${error.message}`);
    }
  }
}
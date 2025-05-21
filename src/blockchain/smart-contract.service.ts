import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import { BlockchainService } from './blockchain.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SmartContractService {
  private contract: ethers.Contract;
  private readonly logger = new Logger(SmartContractService.name);
  private readonly maxRetries = 3;
  
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
        this.logger.log('Smart contract initialized successfully');
      } catch (error) {
        this.logger.error(`Failed to initialize smart contract: ${error.message}`, error.stack);
      }
    } else {
      this.logger.warn(
        'Smart contract not initialized. Missing ' +
        (!contractAddress ? 'contract address' : 'wallet initialization')
      );
    }
  }
  
  async recordMilestone(productId: string, milestone: string): Promise<ethers.TransactionResponse | null> {
    if (!this.contract) {
      this.logger.warn('Cannot record milestone: Smart contract not initialized');
      return null;
    }
    
    let attempts = 0;
    while (attempts < this.maxRetries) {
      try {
        const tx = await this.contract.recordMilestone(
          productId,
          milestone,
          Math.floor(Date.now() / 1000)
        );
        
        // Wait for transaction to be mined (1 confirmation)
        await tx.wait(1);
        this.logger.log(`Successfully recorded milestone for product ${productId}. TX Hash: ${tx.hash}`);
        return tx;
      } catch (error) {
        attempts++;
        if (attempts >= this.maxRetries) {
          this.logger.error(`Failed to record milestone for product ${productId} after ${this.maxRetries} attempts: ${error.message}`, error.stack);
          throw new Error(`Blockchain transaction failed: ${error.message}`);
        }
        this.logger.warn(`Attempt ${attempts}/${this.maxRetries} failed. Retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempts)));
      }
    }
    return null;
  }

  async getProductHistory(productId: string): Promise<string[]> {
    if (!this.contract) {
      this.logger.warn('Cannot get product history: Smart contract not initialized');
      return [];
    }
    
    try {
      return await this.contract.getProductHistory(productId);
    } catch (error) {
      this.logger.error(`Failed to get product history for ${productId}: ${error.message}`, error.stack);
      throw new Error(`Blockchain query failed: ${error.message}`);
    }
  }
}
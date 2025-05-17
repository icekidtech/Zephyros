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
    if (contractAddress) {
      // Initialize contract instance
      this.contract = new ethers.Contract(
        contractAddress,
        contractABI,
        this.blockchainService['wallet']
      );
    }
  }

  async recordMilestone(productId: string, milestone: string): Promise<ethers.TransactionResponse> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contract.recordMilestone(
      productId,
      milestone,
      Math.floor(Date.now() / 1000)
    );
  }

  async getProductHistory(productId: string): Promise<string[]> {
    if (!this.contract) {
      throw new Error('Contract not initialized');
    }
    
    return await this.contract.getProductHistory(productId);
  }
}
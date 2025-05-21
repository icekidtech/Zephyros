import { Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { SmartContractService } from './smart-contract.service';

@Module({
  providers: [BlockchainService, SmartContractService],
  exports: [BlockchainService, SmartContractService],
})
export class BlockchainModule {}
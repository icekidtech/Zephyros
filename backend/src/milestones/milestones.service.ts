import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';
import { Milestone, MilestoneDocument } from './milestone.schema';
import { SmartContractService } from '../blockchain/smart-contract.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectModel(Milestone.name) private milestoneModel: Model<MilestoneDocument>,
    @InjectConnection() private readonly connection: Connection,
    private readonly smartContractService: SmartContractService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMilestone(createMilestoneDto: any): Promise<Milestone> {
    const session = await this.connection.startSession();
    session.startTransaction();
    
    try {
      const milestone = new this.milestoneModel(createMilestoneDto);
      const savedMilestone = await milestone.save({ session });

      // Sync with blockchain
      const txResponse = await this.smartContractService.recordMilestone(
        savedMilestone.product.toString(),
        savedMilestone.title,
      );
      
      if (!txResponse) {
        throw new Error('Failed to sync milestone with blockchain');
      }

      // Send notification
      this.notificationsService.notify(
        `New milestone created: ${savedMilestone.title} for product ${savedMilestone.product}`,
      );

      await session.commitTransaction();
      return savedMilestone;
    } catch (error) {
      await session.abortTransaction();
      console.error('Failed to create milestone:', error);
      throw new InternalServerErrorException('Failed to create milestone: ' + error.message);
    } finally {
      session.endSession();
    }
  }

  async updateMilestoneStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Milestone> {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      const milestone = await this.milestoneModel.findById(id).session(session);
      
      if (!milestone) {
        throw new Error(`Milestone with id ${id} not found`);
      }
      
      // Save previous status to history
      if (!milestone.statusHistory) {
        milestone.statusHistory = [];
      }

      milestone.statusHistory.push({
        status: milestone.status,
        timestamp: new Date(),
        notes: `Status changed from ${milestone.status} to ${status}`
      });

      milestone.status = status;
      
      const updatedMilestone = await this.milestoneModel
        .findByIdAndUpdate(id, milestone, { new: true })
        .session(session);

      // Sync status update with blockchain
      try {
        const txResponse = await this.smartContractService.recordMilestone(
          updatedMilestone.product.toString(),
          `${updatedMilestone.title} - Status: ${status}`
        );
        
        if (txResponse?.hash) {
          // Save transaction hash
          await this.milestoneModel.findByIdAndUpdate(
            id,
            { blockchainTxHash: txResponse.hash },
            { session }
          );
        }
      } catch (error) {
        console.error('Failed to sync status update with blockchain:', error);
        // Continue despite blockchain sync error
      }

      this.notificationsService.notify(
        `Milestone ${updatedMilestone.title} status updated to ${status}`
      );

      await session.commitTransaction();
      return updatedMilestone;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
  
  // Add a new method to verify milestone authenticity
  async verifyMilestone(id: string): Promise<{ isVerified: boolean; blockchainData?: any }> {
    const milestone = await this.milestoneModel.findById(id);
    
    if (!milestone) {
      throw new Error(`Milestone with id ${id} not found`);
    }
    
    if (!milestone.blockchainTxHash) {
      return { isVerified: false };
    }
    
    try {
      // Get blockchain data for verification
      const blockchainData = await this.smartContractService.getProductHistory(
        milestone.product.toString()
      );
      
      // Check if the milestone data exists on blockchain
      const isVerified = blockchainData.some(entry => 
        entry.includes(milestone.title)
      );
      
      return {
        isVerified,
        blockchainData
      };
    } catch (error) {
      console.error('Failed to verify milestone on blockchain:', error);
      return { isVerified: false };
    }
  }

  async getMilestonesByProduct(productId: string, status?: 'pending' | 'approved' | 'rejected'): Promise<Milestone[]> {
    const query: any = { product: productId };
    if (status) {
      query.status = status;
    }
    return this.milestoneModel.find(query).exec();
  }
  async getBlockchainHistory(productId: string): Promise<string[]> {
    try {
      return await this.smartContractService.getProductHistory(productId);
    } catch (error) {
      console.error(`Failed to get blockchain history for product ${productId}:`, error.message);
      return []; // Return empty array if blockchain query fails
    }
  }
}
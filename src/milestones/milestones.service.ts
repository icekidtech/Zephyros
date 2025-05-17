import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Milestone, MilestoneDocument } from './milestone.schema';
import { SmartContractService } from '../blockchain/smart-contract.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MilestonesService {
  constructor(
    @InjectModel(Milestone.name) private milestoneModel: Model<MilestoneDocument>,
    private readonly smartContractService: SmartContractService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async createMilestone(createMilestoneDto: any): Promise<Milestone> {
    const milestone = new this.milestoneModel(createMilestoneDto);
    const savedMilestone = await milestone.save();

    // Sync with blockchain
    try {
      await this.smartContractService.recordMilestone(
        savedMilestone.product.toString(),
        savedMilestone.title,
      );
    } catch (error) {
      console.error('Failed to sync milestone with blockchain:', error);
    }

    // Send notification
    this.notificationsService.notify(
      `New milestone created: ${savedMilestone.title} for product ${savedMilestone.product}`,
    );

    return savedMilestone;
  }

  async updateMilestoneStatus(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<Milestone> {
    const milestone = await this.milestoneModel.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (milestone) {
      this.notificationsService.notify(
        `Milestone ${milestone.title} status updated to ${status}`,
      );
    }

    return milestone;
  }

  async getMilestonesByProduct(productId: string): Promise<Milestone[]> {
    return this.milestoneModel.find({ product: productId }).exec();
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
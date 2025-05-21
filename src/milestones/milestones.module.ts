import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MilestonesController } from './milestones.controller';
import { MilestonesService } from './milestones.service';
import { Milestone, MilestoneSchema } from './milestone.schema';
import { BlockchainModule } from '../blockchain/blockchain.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { UploadsModule } from '../uploads/uploads.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Milestone.name, schema: MilestoneSchema }]),
    BlockchainModule,
    NotificationsModule,
    UploadsModule,
  ],
  controllers: [MilestonesController],
  providers: [MilestonesService],
  exports: [MilestonesService],
})
export class MilestonesModule {}
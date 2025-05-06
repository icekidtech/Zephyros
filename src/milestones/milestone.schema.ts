import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Milestone extends Document {
  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  productId: Types.ObjectId;

  @Prop()
  dueDate: Date;

  @Prop({ type: [Types.ObjectId], ref: 'Upload' })
  documentIds: Types.ObjectId[];

  @Prop({ required: true, enum: ['pending', 'approved', 'rejected'], default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Prop({ default: 0 })
  approvalCount: number;

  @Prop({ default: 0 })
  rejectionCount: number;

  @Prop({
    type: [
      {
        verifierId: { type: Types.ObjectId, ref: 'User', required: true },
        status: { type: String, enum: ['approved', 'rejected'], required: true },
        comment: { type: String },
        date: { type: Date, required: true },
      },
    ],
  })
  verificationLogs: {
    verifierId: Types.ObjectId;
    status: 'approved' | 'rejected';
    comment?: string;
    date: Date;
  }[];

  @Prop()
  blockchainTxHash: string;
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);
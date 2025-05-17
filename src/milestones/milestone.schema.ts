// src/milestones/schemas/milestone.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MilestoneDocument = Milestone & Document;

@Schema({ timestamps: true })
export class Milestone {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';
  
  @Prop()
  location?: string;
  
  @Prop()
  blockchainTxHash?: string;
  
  @Prop()
  verificationMethod?: 'manual' | 'iot' | 'qr';
  
  @Prop({ type: [{ type: Object }], default: [] })
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    updatedBy?: Types.ObjectId;
    notes?: string;
  }>;

  @Prop({ type: Map, of: String })
  metadata: Map<string, string>;
  
  @Prop({ type: [String], default: [] })
  attachments: string[];
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);

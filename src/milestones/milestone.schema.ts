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
}

export const MilestoneSchema = SchemaFactory.createForClass(Milestone);

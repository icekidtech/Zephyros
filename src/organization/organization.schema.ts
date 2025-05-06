import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Organization extends Document {
  @Prop({ required: true, unique: true, index: true })
  name: string;

  @Prop()
  address: string;

  @Prop()
  contactEmail: string;

  @Prop()
  website: string;

  @Prop()
  logoUrl: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop()
  description: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);
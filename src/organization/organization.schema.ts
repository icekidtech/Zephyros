// src/organizations/schemas/organization.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OrganizationDocument = Organization & Document;

@Schema({ timestamps: true })
export class Organization {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  address?: string;

  @Prop()
  contactEmail?: string;

  @Prop()
  website?: string;
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

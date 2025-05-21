// src/products/schemas/product.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Organization', required: true })
  organization: Types.ObjectId;

  @Prop()
  qrCode?: string;

  @Prop()
  image?: string;
  
  @Prop()
  sku?: string;
  
  @Prop()
  batchNumber?: string;
  
  @Prop({ type: Date })
  manufacturingDate?: Date;
  
  @Prop({ type: Date })
  expiryDate?: Date;
  
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

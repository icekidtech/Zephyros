import { IsNotEmpty, IsString, IsOptional, IsDateString, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({ example: 'Premium Coffee Beans', description: 'Name of the product' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Organic Arabica coffee beans from Colombia', description: 'Description of the product', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the organization that owns this product' })
  @IsNotEmpty()
  @IsString()
  organization: string;
  
  @ApiProperty({ example: 'COFFEE-ARABICA-001', description: 'Stock Keeping Unit (SKU)', required: false })
  @IsOptional()
  @IsString()
  sku?: string;
  
  @ApiProperty({ example: 'BATCH-2025-05-001', description: 'Production batch number', required: false })
  @IsOptional()
  @IsString()
  batchNumber?: string;
  
  @ApiProperty({ example: '2025-05-01', description: 'Manufacturing date', required: false })
  @IsOptional()
  @IsDateString()
  manufacturingDate?: string;
  
  @ApiProperty({ example: '2026-05-01', description: 'Expiry date', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;
  
  @ApiProperty({ example: { origin: 'Colombia', grade: 'Premium' }, description: 'Additional product metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
import { IsNotEmpty, IsString, IsOptional, IsEnum, IsObject, ValidateNested, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class MetadataDto {
  [key: string]: string;
}

export class CreateMilestoneDto {
  @ApiProperty({ example: 'Product Manufactured', description: 'Title of the milestone' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: 'Product has completed manufacturing process', description: 'Description of the milestone', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'ID of the product this milestone belongs to' })
  @IsNotEmpty()
  @IsString()
  product: string;

  @ApiProperty({ example: 'pending', description: 'Current status of the milestone', enum: ['pending', 'approved', 'rejected'] })
  @IsEnum(['pending', 'approved', 'rejected'])
  @IsOptional()
  status?: 'pending' | 'approved' | 'rejected' = 'pending';
  
  @ApiProperty({ example: 'Los Angeles, CA', description: 'Location where the milestone occurred', required: false })
  @IsOptional()
  @IsString()
  location?: string;
  
  @ApiProperty({ example: 'manual', description: 'Method used to verify this milestone', enum: ['manual', 'iot', 'qr'], required: false })
  @IsEnum(['manual', 'iot', 'qr'])
  @IsOptional()
  verificationMethod?: 'manual' | 'iot' | 'qr';
  
  @ApiProperty({ 
    example: { batchNumber: '12345', temperature: '72°F' }, 
    description: 'Additional metadata about this milestone',
    required: false
  })
  @IsOptional()
  @IsObject()
  @Type(() => MetadataDto)
  metadata?: Record<string, string>;
}
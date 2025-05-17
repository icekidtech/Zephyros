import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
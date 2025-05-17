import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
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
}
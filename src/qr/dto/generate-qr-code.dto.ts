import { IsNotEmpty, IsObject, ValidateNested, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GenerateQrCodeDto {
  @ApiProperty({ 
    description: 'Data to encode in the QR code',
    example: { id: '123', name: 'Product X' }
  })
  @IsNotEmpty()
  @IsObject()
  data: Record<string, any>;

  @ApiProperty({
    description: 'Optional metadata for the QR code',
    required: false,
    example: { purpose: 'product-verification' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
  
  @ApiProperty({
    description: 'Optional expiration time in milliseconds since epoch',
    required: false,
    example: 1653091200000
  })
  @IsOptional()
  expiresAt?: number;
}

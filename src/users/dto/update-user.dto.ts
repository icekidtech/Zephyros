import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the user', required: false })
  @IsString()
  @IsOptional()
  fullName?: string;

  @ApiProperty({
    example: 'JohnDoe@gmail.com',
    description: 'Email of the user',
    required: false
  })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'password123',
    description: 'Password of the user',
    required: false
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}
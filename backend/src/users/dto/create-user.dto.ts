// dto/create-user.dto.ts

import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {


  @ApiProperty({ example: 'John Doe', description: 'Full name of the user' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({
    example: 'JohnDoe@gmail.com',
    description: 'Email of the user',
  })
  @IsEmail()
  email: string;

    @ApiProperty({
        example: 'password123',
        description: 'Password of the user',
    })
  @IsString()
  @MinLength(6)
  password: string;
  @ApiProperty({ 
    example: 'admin', 
    description: 'Role of the user',
    enum: ['admin', 'manufacturer', 'supplier', 'consumer']
  })
  @IsEnum(UserRole)
  role: UserRole;
}

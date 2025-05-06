import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {

  @ApiProperty({ example: 'JohnDoe@gmail.com', description: 'Email of the user that wants to login' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'Password of the user that wants to login' })
  @IsString()
  @MinLength(6)
  password: string;
}
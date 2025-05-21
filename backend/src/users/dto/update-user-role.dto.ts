import { IsEnum, IsNotEmpty } from 'class-validator';
import { UserRole } from '../user.schema';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserRoleDto {
  @ApiProperty({ 
    example: 'admin', 
    description: 'Role to assign to the user',
    enum: UserRole,
    required: true
  })
  @IsEnum(UserRole)
  @IsNotEmpty()
  role: UserRole;
}
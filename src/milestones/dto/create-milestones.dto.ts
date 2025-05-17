import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CreateMilestoneDto } from './create-milestone.dto';

export class CreateMilestonesDto {
  @ApiProperty({ 
    description: 'Array of milestones to create',
    type: [CreateMilestoneDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateMilestoneDto)
  milestones: CreateMilestoneDto[];
}

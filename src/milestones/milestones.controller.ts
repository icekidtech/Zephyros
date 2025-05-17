import { 
  Controller, 
  Post, 
  Body, 
  Param, 
  Get, 
  Put, 
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Query
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MilestonesService } from './milestones.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadsService } from '../uploads/uploads.service';
import { CreateMilestoneDto } from './dto/create-milestone.dto';
import { CreateMilestonesDto } from './dto/create-milestones.dto';

@ApiTags('milestones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('milestones')
export class MilestonesController {
  constructor(
    private readonly milestonesService: MilestonesService,
    private readonly uploadsService: UploadsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new milestone' })
  @ApiResponse({ status: 201, description: 'Milestone created successfully', type: CreateMilestoneDto })
  async createMilestone(@Body() createMilestoneDto: CreateMilestoneDto) {
    return this.milestonesService.createMilestone(createMilestoneDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update milestone status' })
  @ApiResponse({ status: 200, description: 'Milestone status updated successfully' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'approved' | 'rejected',
  ) {
    return this.milestonesService.updateMilestoneStatus(id, status);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get all milestones for a product' })
  @ApiResponse({ status: 200, description: 'Product milestones retrieved successfully' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'approved', 'rejected'] })
  async getMilestonesByProduct(
    @Param('productId') productId: string,
    @Query('status') status?: 'pending' | 'approved' | 'rejected'
  ) {
    return this.milestonesService.getMilestonesByProduct(productId, status);
  }

  @Get('product/:productId/blockchain-history')
  @ApiOperation({ summary: 'Get blockchain history for a product' })
  @ApiResponse({ status: 200, description: 'Blockchain history retrieved successfully' })
  async getBlockchainHistory(@Param('productId') productId: string) {
    return this.milestonesService.getBlockchainHistory(productId);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload document for a milestone' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  async uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadMilestoneDocument(id, file);
  }
  
  @Get(':id/verify')
  @ApiOperation({ summary: 'Verify milestone authenticity on blockchain' })
  @ApiResponse({ status: 200, description: 'Milestone verification status' })
  async verifyMilestone(@Param('id') id: string) {
    return this.milestonesService.verifyMilestone(id);
  }
    @Post('bulk')
  @ApiOperation({ summary: 'Create multiple milestones in batch' })
  @ApiResponse({ status: 201, description: 'Milestones created successfully' })
  async createMilestones(@Body() createMilestonesDto: CreateMilestonesDto) {
    return Promise.all(
      createMilestonesDto.milestones.map(dto => this.milestonesService.createMilestone(dto))
    );
  }
}

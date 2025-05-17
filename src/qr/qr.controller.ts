import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QrService } from './qr.service';

@ApiTags('qr')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  @ApiOperation({ summary: 'Generate a QR code from data' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully' })
  async generateQRCode(@Body() data: any): Promise<string> {
    return await this.qrService.generateQRCode(data);
  }

  @Get('decode/:data')
  @ApiOperation({ summary: 'Decode QR code data' })
  @ApiResponse({ status: 200, description: 'QR code data decoded successfully' })
  decodeQRCode(@Param('data') data: string): any {
    return this.qrService.decodeQRData(data);
  }
}
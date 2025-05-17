import { Controller, Post, Body, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { QrService } from './qr.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request } from 'express';
import { GenerateQrCodeDto } from './dto/generate-qr-code.dto';

@ApiTags('qr')
@Controller('qr')
export class QrController {
  constructor(private readonly qrService: QrService) {}

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Generate a QR code from data with encryption and signing' })
  @ApiResponse({ status: 201, description: 'QR code generated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data or rate limit exceeded' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async generateQRCode(@Body() generateQrCodeDto: GenerateQrCodeDto, @Req() request: Request): Promise<string> {
    // Extract client IP for rate limiting
    const clientIp = request.ip || 
                    (request.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || 
                    '0.0.0.0';
                    
    return await this.qrService.generateQRCode(generateQrCodeDto, clientIp);
  }

  @Get('decode/:data')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Decode and verify QR code data' })
  @ApiResponse({ status: 200, description: 'QR code data decoded and verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid QR code data or signature verification failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  decodeQRCode(@Param('data') data: string): any {
    return this.qrService.decodeQRData(data, true);
  }
  
  @Get('verify/:data')
  @ApiOperation({ summary: 'Verify QR code authenticity without decoding full data' })
  @ApiResponse({ status: 200, description: 'QR code verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid QR code or verification failed' })
  verifyQRCode(@Param('data') data: string): { isValid: boolean } {
    try {
      // Just verify the signature without returning the full data
      this.qrService.decodeQRData(data, true);
      return { isValid: true };
    } catch (error) {
      return { isValid: false };
    }
  }
}
import { Module } from '@nestjs/common';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';
import * as QRCode from 'qrcode';

@Module({
  providers: [QrService],
  controllers: [QrController],
  exports: [QrService],
})
export class QrModule {}
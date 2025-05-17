import { Injectable } from '@nestjs/common';
import * as QRCode from 'qrcode';

@Injectable()
export class QrService {
  async generateQRCode(data: any): Promise<string> {
    try {
      // Convert data to string if it's an object
      const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      // Generate QR code as data URL (base64)
      const qrCode = await QRCode.toDataURL(stringData);
      return qrCode;
    } catch (error) {
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  decodeQRData(data: string): any {
    try {
      // If the data is JSON, parse it
      return JSON.parse(data);
    } catch {
      // If not JSON, return as is
      return data;
    }
  }
}
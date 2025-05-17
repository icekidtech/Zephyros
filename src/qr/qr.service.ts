import { Injectable, BadRequestException } from '@nestjs/common';
import * as QRCode from 'qrcode';
import * as CryptoJS from 'crypto-js';
import { ConfigService } from '@nestjs/config';
import { createSign, createVerify } from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';

interface QRData {
  data: any;
  timestamp: number;
  signature?: string;
}

@Injectable()
export class QrService {
  private readonly encryptionKey: string;
  private readonly privateKeyPath: string;
  private readonly publicKeyPath: string;
  private readonly requestLimit: Map<string, { count: number, timestamp: number }>;
  private readonly maxRequestsPerMinute: number = 60;

  constructor(private readonly configService: ConfigService) {
    // Use a secure encryption key from environment variables
    this.encryptionKey = this.configService.get<string>('QR_ENCRYPTION_KEY') || 'default-secure-key-change-in-production';
    
    // Paths for RSA keys (these would be created and securely stored)
    this.privateKeyPath = join(__dirname, '../../keys/private.pem');
    this.publicKeyPath = join(__dirname, '../../keys/public.pem');
    
    // Initialize request tracking for rate limiting
    this.requestLimit = new Map();
  }

  private validateData(data: any): void {
    // Validate data structure
    if (!data) {
      throw new BadRequestException('QR data cannot be empty');
    }

    // Check for malicious content - add specific validations based on expected data structure
    if (typeof data === 'string' && data.length > 1000) {
      throw new BadRequestException('QR data exceeds maximum length');
    }
    
    if (typeof data === 'object') {
      // Validate object properties based on expected schema
      // This should be customized based on your application's needs
      const stringified = JSON.stringify(data);
      if (stringified.length > 2000) {
        throw new BadRequestException('QR data object is too large');
      }
    }
  }

  private encryptData(data: any): string {
    // Convert data to string
    const stringData = typeof data === 'object' ? JSON.stringify(data) : String(data);
    
    // Encrypt data
    return CryptoJS.AES.encrypt(stringData, this.encryptionKey).toString();
  }

  private decryptData(encryptedData: string): string {
    // Decrypt data
    const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private signData(data: string): string {
    try {
      // This is a placeholder for digital signature implementation
      // In a real implementation, you'd use proper RSA signing:
      /*
      const privateKey = readFileSync(this.privateKeyPath, 'utf8');
      const sign = createSign('SHA256');
      sign.update(data);
      sign.end();
      return sign.sign(privateKey, 'base64');
      */
      
      // Simplified signature for now (HMAC)
      return CryptoJS.HmacSHA256(data, this.encryptionKey).toString();
    } catch (error) {
      console.error('Error signing data:', error);
      throw new Error('Failed to sign QR data');
    }
  }

  private verifySignature(data: string, signature: string): boolean {
    try {
      // This is a placeholder for signature verification
      // In a real implementation, you'd use proper RSA verification:
      /*
      const publicKey = readFileSync(this.publicKeyPath, 'utf8');
      const verify = createVerify('SHA256');
      verify.update(data);
      verify.end();
      return verify.verify(publicKey, signature, 'base64');
      */
      
      // Simplified verification for now (HMAC)
      const computedSignature = CryptoJS.HmacSHA256(data, this.encryptionKey).toString();
      return computedSignature === signature;
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  private checkRateLimit(clientIp: string): boolean {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    
    // Clear old entries
    this.requestLimit.forEach((value, key) => {
      if (value.timestamp < oneMinuteAgo) {
        this.requestLimit.delete(key);
      }
    });
    
    // Check and update client's request count
    const clientRequests = this.requestLimit.get(clientIp);
    
    if (!clientRequests) {
      this.requestLimit.set(clientIp, { count: 1, timestamp: now });
      return true;
    }
    
    if (clientRequests.count >= this.maxRequestsPerMinute) {
      return false; // Rate limit exceeded
    }
    
    // Increment request count
    this.requestLimit.set(clientIp, { 
      count: clientRequests.count + 1, 
      timestamp: clientRequests.timestamp 
    });
    
    return true;
  }

  async generateQRCode(data: any, clientIp: string = '0.0.0.0'): Promise<string> {
    try {
      // Check rate limit
      if (!this.checkRateLimit(clientIp)) {
        throw new BadRequestException('Rate limit exceeded. Try again later.');
      }
      
      // Validate the data
      this.validateData(data);
      
      // Prepare data with timestamp
      const qrData: QRData = {
        data,
        timestamp: Date.now()
      };
      
      // Convert to string
      const stringData = JSON.stringify(qrData);
      
      // Sign the data
      const signature = this.signData(stringData);
      
      // Add signature
      qrData.signature = signature;
      
      // Encrypt the signed data
      const encryptedData = this.encryptData(qrData);
      
      // Generate QR code as data URL (base64)
      const qrCode = await QRCode.toDataURL(encryptedData);
      
      return qrCode;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  decodeQRData(encryptedData: string, verifySignature: boolean = true): any {
    try {
      // Decrypt the data
      const decryptedData = this.decryptData(encryptedData);
      
      // Parse decrypted data
      const qrData: QRData = JSON.parse(decryptedData);
      
      // Verify signature if requested
      if (verifySignature && qrData.signature) {
        // Create data string without signature for verification
        const { signature, ...dataWithoutSignature } = qrData;
        const dataToVerify = JSON.stringify(dataWithoutSignature);
        
        if (!this.verifySignature(dataToVerify, signature)) {
          throw new BadRequestException('QR code signature verification failed. Data may have been tampered with.');
        }
      }
      
      // Return the original data
      return qrData.data;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof SyntaxError) {
        throw new BadRequestException('Invalid QR code format');
      }
      // If not JSON or encrypted, return as is
      return encryptedData;
    }
  }
}
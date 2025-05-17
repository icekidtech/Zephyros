// src/uploads/uploads.service.ts

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GridFsStorage } from 'multer-gridfs-storage';
import { MulterModuleOptions } from '@nestjs/platform-express';
import { MongoClient, GridFSBucket, MongoClientOptions } from 'mongodb';

@Injectable()
export class UploadsService {
  private readonly mongoUri: string;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.mongoUri = this.configService.get<string>('MONGODB_URI');
    this.bucketName = this.configService.get<string>('GRIDFS_BUCKET') || 'uploads';
  }

  /**
   * Returns Multer options configured for GridFS storage,
   * including file size limits and MIME filtering.
   */
  getMulterOptions(): MulterModuleOptions {
    const storage = new GridFsStorage({
      url: this.mongoUri,
      options: { useNewUrlParser: true, useUnifiedTopology: true },
      file: (_req, file) => ({
        filename: file.originalname,
        bucketName: this.bucketName,
      }),
    });

    return {
      storage,
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
      fileFilter: (_req, file, cb) => {
        if (!file.mimetype.match(/^image\//)) {
          return cb(new Error('Only image uploads are allowed'), false);
        }
        cb(null, true);
      },
    };
  }

  /**
   * Streams the file buffer into GridFS and returns the file ID.
   */
  async uploadFile(file: Express.Multer.File): Promise<string> {
    const clientOptions: MongoClientOptions = {};
    const client = new MongoClient(this.mongoUri, clientOptions);

    try {
      await client.connect();
      const db = client.db();
      const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

      return await new Promise((resolve, reject) => {
        const stream = bucket.openUploadStream(file.originalname, {
          metadata: { contentType: file.mimetype },
        });
        stream.end(file.buffer);

        stream.on('finish', () => resolve(stream.id.toString()));
        stream.on('error', err => reject(new InternalServerErrorException(err.message)));
      });
    } catch (err) {
      throw new InternalServerErrorException(`Upload failed: ${err.message}`);
    } finally {
      await client.close();
    }
  }

  /**
   * Uploads a milestone document to GridFS and returns the file ID and filename.
   */
  async uploadMilestoneDocument(milestoneId: string, file: Express.Multer.File): Promise<any> {
    const clientOptions: MongoClientOptions = {};
    const client = new MongoClient(this.mongoUri, clientOptions);

    try {
      await client.connect();
      const db = client.db();
      const bucket = new GridFSBucket(db, { bucketName: this.bucketName });

      return new Promise((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(file.originalname, {
          metadata: { milestoneId, contentType: file.mimetype },
        });
        uploadStream.end(file.buffer);

        uploadStream.on('finish', () => resolve({ fileId: uploadStream.id, filename: file.originalname }));
        uploadStream.on('error', (err) => reject(new InternalServerErrorException(err.message)));
      });
    } catch (err) {
      throw new InternalServerErrorException(`Failed to upload document: ${err.message}`);
    } finally {
      await client.close();
    }
  }
}

// src/uploads/uploads.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadsService } from './uploads.service';
import { GridFsStorage } from 'multer-gridfs-storage';
import * as multer from 'multer';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: new GridFsStorage({
        url: 'mongodb+srv://endiejames123:pass1@cluster0.od5upzb.mongodb.net/zephyrosdb',
        options: { useNewUrlParser: true, useUnifiedTopology: true },
        file: (req, file) => {
          return {
            filename: file.originalname,
            bucketName: 'uploads',
          };
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // Limit file size to 5MB
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new Error('File upload failed');
    }

    // Extract the file ID from the metadata
    const fileId = file.id || file._id; // GridFS may use _id instead of id

    return { fileId, filename: file.filename };
  }
}

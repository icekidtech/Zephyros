import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { QrService } from '../qr/qr.service';
import { UploadsService } from '../uploads/uploads.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly qrService: QrService,
    private readonly uploadsService: UploadsService,
  ) {}

  async createProduct(createProductDto: any, image?: Express.Multer.File): Promise<Product> {
    // Create new product
    const product = new this.productModel(createProductDto);
    const savedProduct = await product.save();

    // Generate QR code containing product ID and basic info
    const qrData = {
      id: savedProduct._id,
      name: savedProduct.name,
      organization: savedProduct.organization,
    };
    
    try {
      const qrCode = await this.qrService.generateQRCode(qrData);
      // Update product with QR code
      savedProduct.qrCode = qrCode;
      await savedProduct.save();
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }

    // Handle image upload if provided
    if (image) {
      try {
        const uploadResult = await this.uploadsService.uploadMilestoneDocument(
          savedProduct._id.toString(),
          image,
        );
        // Update product with image reference
        savedProduct.image = uploadResult.fileId;
        await savedProduct.save();
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    }

    return savedProduct;
  }

  async findById(id: string): Promise<Product> {
    return this.productModel.findById(id).exec();
  }

  async findByOrganization(organizationId: string): Promise<Product[]> {
    return this.productModel.find({ organization: organizationId }).exec();
  }

  async updateProduct(id: string, updateProductDto: any): Promise<Product> {
    return this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
  }
}
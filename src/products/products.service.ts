import { Injectable, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, isValidObjectId } from 'mongoose';
import { Product, ProductDocument } from './product.schema';
import { QrService } from '../qr/qr.service';
import { UploadsService } from '../uploads/uploads.service';
import { CreateProductDto } from './dto/create-product.dto';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly frontendUrl: string;

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    private readonly qrService: QrService,
    private readonly uploadsService: UploadsService,
    private readonly configService: ConfigService,
  ) {
    this.frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'https://zephyros.app';
  }
  async createProduct(createProductDto: CreateProductDto, image?: Express.Multer.File): Promise<Product> {
    try {
      // Validate organization ID
      if (!isValidObjectId(createProductDto.organization)) {
        throw new BadRequestException('Invalid organization ID format');
      }

      // Generate a unique product ID if SKU is not provided
      if (!createProductDto.sku) {
        createProductDto.sku = `PROD-${uuidv4().slice(0, 8)}`;
      }

      // Create new product
      const product = new this.productModel(createProductDto);
      const savedProduct = await product.save();

      // Generate QR code containing product ID and URL for verification
      const qrUrl = `${this.frontendUrl}/verify/${savedProduct._id}`;
      const qrData = {
        id: savedProduct._id,
        name: savedProduct.name,
        organization: savedProduct.organization,
        sku: savedProduct.sku,
        url: qrUrl,
      };
      
      try {
        const qrCode = await this.qrService.generateQRCode(qrData);
        // Update product with QR code
        savedProduct.qrCode = qrCode;
        await savedProduct.save();
      } catch (error) {
        console.error('Failed to generate QR code:', error);
        throw new InternalServerErrorException('Failed to generate QR code for product');
      }

      // Handle image upload if provided
      if (image) {
        try {
          // Validate image mime type
          if (!image.mimetype.match(/^image\//)) {
            throw new BadRequestException('Only image files are allowed');
          }

          // Upload the image
          const uploadResult = await this.uploadsService.uploadMilestoneDocument(
            savedProduct._id.toString(),
            image,
          );
          
          // Update product with image reference
          savedProduct.image = uploadResult.fileId;
          await savedProduct.save();
        } catch (error) {
          console.error('Failed to upload image:', error);
          if (error instanceof BadRequestException) {
            throw error;
          }
          throw new InternalServerErrorException('Failed to upload product image');
        }
      }

      return savedProduct;
    } catch (error) {
      if (error instanceof BadRequestException || 
          error instanceof InternalServerErrorException || 
          error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(`Failed to create product: ${error.message}`);
    }
  }
  async findById(id: string): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format');
    }
    
    const product = await this.productModel.findById(id).exec();
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    return product;
  }
  async findByOrganization(organizationId: string): Promise<Product[]> {
    if (!isValidObjectId(organizationId)) {
      throw new BadRequestException('Invalid organization ID format');
    }
    
    return this.productModel.find({ organization: organizationId }).exec();
  }
  async updateProduct(id: string, updateProductDto: any, image?: Express.Multer.File): Promise<Product> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid product ID format');
    }
    
    // Find the product first
    const product = await this.productModel.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    
    // Update product fields
    const updatedProduct = await this.productModel
      .findByIdAndUpdate(id, updateProductDto, { new: true })
      .exec();
      
    // Handle image upload if provided
    if (image && updatedProduct) {
      try {
        // Validate image mime type
        if (!image.mimetype.match(/^image\//)) {
          throw new BadRequestException('Only image files are allowed');
        }

        const uploadResult = await this.uploadsService.uploadMilestoneDocument(
          updatedProduct._id.toString(),
          image,
        );
        
        // Update product with new image reference
        updatedProduct.image = uploadResult.fileId;
        await updatedProduct.save();
      } catch (error) {
        console.error('Failed to upload updated image:', error);
        if (error instanceof BadRequestException) {
          throw error;
        }
        throw new InternalServerErrorException('Failed to upload product image');
      }
    }
    
    return updatedProduct;
  }
}
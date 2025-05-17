import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getModelToken } from '@nestjs/mongoose';
import { Product } from './product.schema';
import { QrService } from '../qr/qr.service';
import { UploadsService } from '../uploads/uploads.service';
import { ConfigService } from '@nestjs/config';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid');

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: Model<Product>;
  let qrService: QrService;
  let uploadsService: UploadsService;

  const mockProductModel = {
    new: jest.fn(),
    constructor: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    exec: jest.fn(),
  };

  const mockQrService = {
    generateQRCode: jest.fn(),
  };

  const mockUploadsService = {
    uploadMilestoneDocument: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockImplementation((key: string) => {
      if (key === 'FRONTEND_URL') {
        return 'https://zephyros.app';
      }
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: QrService,
          useValue: mockQrService,
        },
        {
          provide: UploadsService,
          useValue: mockUploadsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productModel = module.get<Model<Product>>(getModelToken(Product.name));
    qrService = module.get<QrService>(QrService);
    uploadsService = module.get<UploadsService>(UploadsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findById', () => {
    it('should return a product when product exists', async () => {
      const mockProduct = { _id: 'valid-id', name: 'Test Product' };
      
      mockProductModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProduct)
      });
      
      const result = await service.findById('valid-id');
      expect(result).toEqual(mockProduct);
    });

    it('should throw BadRequestException when id format is invalid', async () => {
      await expect(service.findById('invalid-id!')).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when product not found', async () => {
      mockProductModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null)
      });
      
      await expect(service.findById('507f1f77bcf86cd799439011')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByOrganization', () => {
    it('should return products for an organization', async () => {
      const mockProducts = [
        { _id: 'product1', name: 'Product 1' },
        { _id: 'product2', name: 'Product 2' },
      ];
      
      mockProductModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockProducts)
      });
      
      const result = await service.findByOrganization('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockProducts);
    });

    it('should throw BadRequestException when organization ID format is invalid', async () => {
      await expect(service.findByOrganization('invalid-org-id!')).rejects.toThrow(BadRequestException);
    });
  });
});

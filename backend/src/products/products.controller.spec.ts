import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    createProduct: jest.fn(),
    findById: jest.fn(),
    findByOrganization: jest.fn(),
    updateProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'A test product',
        organization: '507f1f77bcf86cd799439011',
      };
      
      const expectedProduct = {
        _id: 'product-id',
        ...createProductDto,
        qrCode: 'data:image/png;base64,qrcode-data',
      };
      
      mockProductsService.createProduct.mockResolvedValue(expectedProduct);
      
      const mockFile = { originalname: 'test.jpg', buffer: Buffer.from('test') } as Express.Multer.File;
      
      const result = await controller.createProduct(createProductDto, mockFile);
      
      expect(result).toEqual(expectedProduct);
      expect(service.createProduct).toHaveBeenCalledWith(createProductDto, mockFile);
    });
  });

  describe('findOne', () => {
    it('should find a product by id', async () => {
      const expectedProduct = {
        _id: 'product-id',
        name: 'Test Product',
        description: 'A test product',
      };
      
      mockProductsService.findById.mockResolvedValue(expectedProduct);
      
      const result = await controller.findOne('product-id');
      
      expect(result).toEqual(expectedProduct);
      expect(service.findById).toHaveBeenCalledWith('product-id');
    });
  });

  describe('findByOrganization', () => {
    it('should find products by organization', async () => {
      const expectedProducts = [
        {
          _id: 'product-1',
          name: 'Product 1',
          organization: '507f1f77bcf86cd799439011',
        },
        {
          _id: 'product-2',
          name: 'Product 2',
          organization: '507f1f77bcf86cd799439011',
        },
      ];
      
      mockProductsService.findByOrganization.mockResolvedValue(expectedProducts);
      
      const result = await controller.findByOrganization('507f1f77bcf86cd799439011');
      
      expect(result).toEqual(expectedProducts);
      expect(service.findByOrganization).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const updateProductDto = {
        name: 'Updated Product',
        description: 'Updated description',
      };
      
      const expectedProduct = {
        _id: 'product-id',
        name: 'Updated Product',
        description: 'Updated description',
        organization: '507f1f77bcf86cd799439011',
      };
      
      mockProductsService.updateProduct.mockResolvedValue(expectedProduct);
      
      const mockFile = { originalname: 'updated.jpg', buffer: Buffer.from('test') } as Express.Multer.File;
      
      const result = await controller.update('product-id', updateProductDto, mockFile);
      
      expect(result).toEqual(expectedProduct);
      expect(service.updateProduct).toHaveBeenCalledWith('product-id', updateProductDto, mockFile);
    });
  });
});

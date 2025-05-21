import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param, 
  Put,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('products')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ 
    summary: 'Create a new product', 
    description: 'Creates a new product with metadata, generates a unique QR code, and optionally uploads a product image' 
  })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid data' })
  @ApiResponse({ status: 500, description: 'Error during QR code generation or image upload' })
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() image?: Express.Multer.File,
  ){
    return this.productsService.createProduct(createProductDto, image);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiResponse({ status: 200, description: 'Product found successfully' })
  @ApiResponse({ status: 400, description: 'Invalid product ID format' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findById(id);
  }
  @Get('organization/:organizationId')
  @ApiOperation({ 
    summary: 'Get all products for an organization',
    description: 'Retrieves all products that belong to a specific organization'
  })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid organization ID format' })
  async findByOrganization(@Param('organizationId') organizationId: string) {
    return this.productsService.findByOrganization(organizationId);
  }
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 400, description: 'Bad request or invalid data' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: Partial<CreateProductDto>,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    return this.productsService.updateProduct(id, updateProductDto, image);
  }
}
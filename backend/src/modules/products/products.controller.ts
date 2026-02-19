import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductResponseDto } from './dto/product-response.dto';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  async findAll(): Promise<ProductResponseDto[]> {
    return this.productsService.findAll();
  }

  @Get('low-stock')
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    return this.productsService.getLowStockProducts();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.findOne(+id);
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string): Promise<ProductResponseDto> {
    return this.productsService.findBySku(sku);
  }

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(createProductDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.productsService.remove(+id);
  }
}

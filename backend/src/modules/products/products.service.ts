import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Product } from "./products.entity";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ProductResponseDto } from "./dto/product-response.dto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>
  ) {}

  // ✅ GET ALL ACTIVE PRODUCTS
  async findAll(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
    return products.map(this.mapToResponseDto);
  }

  // ✅ GET SINGLE PRODUCT BY ID
  async findOne(id: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return this.mapToResponseDto(product);
  }

  // ✅ GET PRODUCT BY SKU
  async findBySku(sku: string): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { sku, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU ${sku} not found`);
    }

    return this.mapToResponseDto(product);
  }

  // ✅ CREATE NEW PRODUCT (with SKU uniqueness check on ACTIVE products only)
  async create(createProductDto: CreateProductDto): Promise<ProductResponseDto> {
    // 🔥 FIX: Only check active products for SKU uniqueness
    const existingProduct = await this.productsRepository.findOne({
      where: { sku: createProductDto.sku, isActive: true },
    });

    if (existingProduct) {
      throw new BadRequestException(`Product with SKU ${createProductDto.sku} already exists`);
    }

    const product = this.productsRepository.create(createProductDto);
    await this.productsRepository.save(product);

    return this.mapToResponseDto(product);
  }

  // ✅ UPDATE PRODUCT (with SKU uniqueness check excluding current product)
  async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    // 🔥 FIX: Only check other ACTIVE products for SKU uniqueness
    if (updateProductDto.sku && updateProductDto.sku !== product.sku) {
      const existingProduct = await this.productsRepository.findOne({
        where: { sku: updateProductDto.sku, isActive: true },
      });

      if (existingProduct) {
        throw new BadRequestException(`SKU ${updateProductDto.sku} already exists`);
      }
    }

    Object.assign(product, updateProductDto);
    await this.productsRepository.save(product);

    return this.mapToResponseDto(product);
  }

  // ✅ SOFT DELETE PRODUCT (set isActive = false)
  async remove(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    product.isActive = false;
    await this.productsRepository.save(product);
  }

  // ✅ GET LOW STOCK PRODUCTS (stock < minStock AND isActive = true)
  async getLowStockProducts(): Promise<ProductResponseDto[]> {
    const products = await this.productsRepository.createQueryBuilder("product").where("product.stock < product.minStock").andWhere("product.isActive = :isActive", { isActive: true }).getMany();

    return products.map(this.mapToResponseDto);
  }

  // ✅ UPDATE STOCK (for stock adjustments)
  async updateStock(productId: number, quantity: number): Promise<ProductResponseDto> {
    const product = await this.productsRepository.findOne({
      where: { id: productId, isActive: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    product.stock += quantity;
    await this.productsRepository.save(product);

    return this.mapToResponseDto(product);
  }

  // ✅ MAP ENTITY TO DTO
  private mapToResponseDto(product: Product): ProductResponseDto {
    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      size: product.size,
      color: product.color,
      hpp: product.hpp,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      description: product.description,
      imageUrl: product.imageUrl,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }
}

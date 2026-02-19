import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { StockMovement } from './entities/stock-movement.entity';
import { StockIn } from './entities/stock-in.entity';
import { StockInDto } from './dto/stock-in.dto';
import { StockMovementResponseDto } from './dto/stock-movement-response.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockMovement)
    private stockMovementsRepository: Repository<StockMovement>,
    @InjectRepository(StockIn)
    private stockInRepository: Repository<StockIn>,
    private productsService: ProductsService,
  ) {}

  async recordStockMovement(
    productId: number,
    type: string,
    quantity: number,
    referenceType?: string,
    referenceId?: number,
    notes?: string,
  ): Promise<StockMovement> {
    const movement = this.stockMovementsRepository.create({
      productId,
      type,
      quantity,
      referenceType,
      referenceId,
      notes,
    });

    return this.stockMovementsRepository.save(movement);
  }

  async addStock(stockInDto: StockInDto): Promise<void> {
    const stockIn = this.stockInRepository.create(stockInDto);
    await this.stockInRepository.save(stockIn);

    await this.productsService.updateStock(stockInDto.productId, stockInDto.quantity);

    await this.recordStockMovement(
      stockInDto.productId,
      'in',
      stockInDto.quantity,
      'stock_in',
      stockIn.id,
      stockInDto.notes,
    );

    const product = await this.productsService.findOne(stockInDto.productId);
    const newHpp = ((product.hpp * product.stock) + (stockInDto.unitCost * stockInDto.quantity)) / 
                   (product.stock + stockInDto.quantity);
    
    await this.productsService.update(stockInDto.productId, { hpp: newHpp });
  }

  async getStockMovements(productId?: number): Promise<StockMovementResponseDto[]> {
    let movements: StockMovement[];

    if (productId) {
      movements = await this.stockMovementsRepository.find({
        where: { productId },
        order: { createdAt: 'DESC' },
      });
    } else {
      movements = await this.stockMovementsRepository.find({
        order: { createdAt: 'DESC' },
      });
    }

    return movements.map(this.mapToResponseDto);
  }

  async getStockHistoryByDateRange(
    startDate: Date,
    endDate: Date,
    productId?: number,
  ): Promise<StockMovementResponseDto[]> {
    let movements: StockMovement[];

    if (productId) {
      movements = await this.stockMovementsRepository.find({
        where: {
          productId,
          createdAt: Between(startDate, endDate),
        },
        order: { createdAt: 'DESC' },
      });
    } else {
      movements = await this.stockMovementsRepository.find({
        where: {
          createdAt: Between(startDate, endDate),
        },
        order: { createdAt: 'DESC' },
      });
    }

    return movements.map(this.mapToResponseDto);
  }

  private mapToResponseDto(movement: StockMovement): StockMovementResponseDto {
    return {
      id: movement.id,
      productId: movement.productId,
      type: movement.type,
      quantity: movement.quantity,
      referenceType: movement.referenceType,
      referenceId: movement.referenceId,
      notes: movement.notes,
      createdAt: movement.createdAt,
    };
  }
}

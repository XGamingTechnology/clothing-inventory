import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { StockInDto } from './dto/stock-in.dto';
import { StockMovementResponseDto } from './dto/stock-movement-response.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('movements')
  async getStockMovements(
    @Query('productId') productId?: string,
  ): Promise<StockMovementResponseDto[]> {
    return this.stockService.getStockMovements(productId ? +productId : undefined);
  }

  @Post('in')
  async addStock(@Body() stockInDto: StockInDto): Promise<void> {
    return this.stockService.addStock(stockInDto);
  }

  @Get('history')
  async getStockHistoryByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
    @Query('productId') productId?: string,
  ): Promise<StockMovementResponseDto[]> {
    return this.stockService.getStockHistoryByDateRange(
      new Date(startDate),
      new Date(endDate),
      productId ? +productId : undefined,
    );
  }
}

import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OrderResponseDto> {
    return this.ordersService.findOne(+id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(+id, updateOrderStatusDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    return this.ordersService.remove(+id);
  }

  @Get('date-range')
  async getOrdersByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<OrderResponseDto[]> {
    return this.ordersService.getOrdersByDateRange(new Date(startDate), new Date(endDate));
  }
}

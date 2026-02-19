import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({ relations: ['items'] });
    return orders.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const orderNumber = await this.generateOrderNumber();

    let totalAmount = 0;
    let totalHpp = 0;

    const items: OrderItem[] = [];
    for (const itemDto of createOrderDto.items) {
      const product = await this.productsService.findOne(itemDto.productId);

      if (product.stock < itemDto.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${itemDto.quantity}`,
        );
      }

      const subtotal = product.sellingPrice * itemDto.quantity;
      const itemHpp = product.hpp * itemDto.quantity;

      totalAmount += subtotal;
      totalHpp += itemHpp;

      const orderItem = this.orderItemsRepository.create({
        productId: itemDto.productId,
        productName: product.name,
        productSku: product.sku,
        size: itemDto.size || product.size,
        color: itemDto.color || product.color,
        quantity: itemDto.quantity,
        unitPrice: product.sellingPrice,
        unitHpp: product.hpp,
        subtotal: subtotal,
      });

      items.push(orderItem);
    }

    const profit = totalAmount - totalHpp;

    const order = this.ordersRepository.create({
      orderNumber,
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      totalAmount,
      totalHpp,
      profit,
      status: createOrderDto.status || 'pending',
      paymentStatus: 'unpaid',
      notes: createOrderDto.notes,
      items,
    });

    await this.ordersRepository.save(order);

    for (const itemDto of createOrderDto.items) {
      await this.productsService.updateStock(itemDto.productId, -itemDto.quantity);
    }

    return this.mapToResponseDto(order);
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({ where: { id }, relations: ['items'] });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    order.status = updateOrderStatusDto.status;
    await this.ordersRepository.save(order);

    return this.mapToResponseDto(order);
  }

  async remove(id: number): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    await this.ordersRepository.remove(order);
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['items'],
    });

    return orders.map(this.mapToResponseDto);
  }

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = await this.ordersRepository.count({
      where: {
        createdAt: Between(startOfDay, endOfDay),
      },
    });

    const sequence = String(count + 1).padStart(4, '0');

    return `ORD-${year}${month}${day}-${sequence}`;
  }

  private mapToResponseDto(order: Order): OrderResponseDto {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      totalAmount: order.totalAmount,
      totalHpp: order.totalHpp,
      profit: order.profit,
      status: order.status,
      paymentStatus: order.paymentStatus,
      notes: order.notes,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}

import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, DataSource, QueryRunner } from "typeorm";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
// ✅ FIX: Path import Product yang benar (sesuaikan dengan struktur folder kamu)
import { Product } from "../../modules/products/products.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderResponseDto } from "./dto/order-response.dto";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private dataSource: DataSource
  ) {}

  async findAll(): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      relations: ["items"], // ✅ Cukup 'items', tidak perlu 'items.product'
      order: { createdAt: "DESC" },
    });
    return orders.map(this.mapToResponseDto);
  }

  async findOne(id: number): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["items"], // ✅ Cukup 'items'
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return this.mapToResponseDto(order);
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const orderNumber = await this.generateOrderNumber(queryRunner);

      let totalAmount = 0;
      let totalHpp = 0;
      const items: OrderItem[] = [];

      for (const itemDto of createOrderDto.items) {
        // 🔒 Lock product row untuk prevent race condition
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: itemDto.productId },
          lock: { mode: "pessimistic_write" },
        });

        if (!product) {
          throw new NotFoundException(`Product ID ${itemDto.productId} not found`);
        }

        if (product.stock < itemDto.quantity) {
          throw new BadRequestException(`Stok ${product.name} tidak cukup. Tersedia: ${product.stock}, Diminta: ${itemDto.quantity}`);
        }

        const subtotal = Number(product.sellingPrice) * itemDto.quantity;
        const itemHpp = Number(product.hpp) * itemDto.quantity;

        totalAmount += subtotal;
        totalHpp += itemHpp;

        // Kurangi stok
        product.stock -= itemDto.quantity;
        await queryRunner.manager.save(product);

        // Buat OrderItem dengan snapshot data
        const orderItem = queryRunner.manager.create(OrderItem, {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          size: product.size,
          color: product.color,
          quantity: itemDto.quantity,
          unitPrice: product.sellingPrice,
          unitHpp: product.hpp,
          subtotal,
        });

        items.push(orderItem);
      }

      const profit = totalAmount - totalHpp;

      const order = queryRunner.manager.create(Order, {
        orderNumber,
        customerName: createOrderDto.customerName,
        customerPhone: createOrderDto.customerPhone,
        totalAmount,
        totalHpp,
        profit,
        status: createOrderDto.status || "pending",
        paymentStatus: "unpaid",
        notes: createOrderDto.notes,
        items,
      });

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      return this.mapToResponseDto(savedOrder);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error("Create order error:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<OrderResponseDto[]> {
    const orders = await this.ordersRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ["items"], // ✅ Cukup 'items'
      order: { createdAt: "DESC" },
    });
    return orders.map(this.mapToResponseDto);
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["items"], // ✅ Cukup 'items'
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Jika dibatalkan, kembalikan stok
    if (order.status === "pending" && updateOrderStatusDto.status === "cancelled") {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        for (const item of order.items) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: item.productId },
            lock: { mode: "pessimistic_write" },
          });
          if (product) {
            product.stock += item.quantity;
            await queryRunner.manager.save(product);
          }
        }
        order.status = updateOrderStatusDto.status;
        await queryRunner.manager.save(order);
        await queryRunner.commitTransaction();
      } catch (error) {
        await queryRunner.rollbackTransaction();
        throw error;
      } finally {
        await queryRunner.release();
      }
    } else {
      order.status = updateOrderStatusDto.status;
      await this.ordersRepository.save(order);
    }

    return this.mapToResponseDto(order);
  }

  // ✅ FIXED: Financial Report - HAPUS "items.product" dari relations!
  async getFinancialReport(startDate: Date, endDate: Date) {
    // ✅ FIX: Hanya load 'items', TIDAK PERLU 'items.product' karena OrderItem pakai snapshot data
    const orders = await this.ordersRepository.find({
      where: {
        status: "completed",
        createdAt: Between(startDate, endDate),
      },
      relations: ["items"], // ✅ FIX: HAPUS "items.product" dari sini!
    });

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
    const totalProfit = orders.reduce((sum, order) => sum + Number(order.profit || 0), 0);
    const totalCost = totalRevenue - totalProfit;
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Top products analysis - ✅ Pakai snapshot data dari OrderItem
    const productSales: Record<string, any> = {};
    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            productName: item.productName, // ✅ Dari snapshot (bukan item.product.name)
            productSku: item.productSku, // ✅ Dari snapshot
            quantitySold: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSales[item.productId].quantitySold += item.quantity;
        productSales[item.productId].revenue += Number(item.subtotal || 0);
        productSales[item.productId].profit += Number(item.subtotal || 0) - Number(item.unitHpp || 0) * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10);

    // Revenue by day (for chart/trend)
    const revenueByDay: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      if (!revenueByDay[date]) {
        revenueByDay[date] = { revenue: 0, orders: 0 };
      }
      revenueByDay[date].revenue += Number(order.totalAmount || 0);
      revenueByDay[date].orders += 1;
    });

    const dailyTrend = Object.entries(revenueByDay)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      summary: {
        totalRevenue,
        totalProfit,
        totalCost,
        totalOrders,
        avgOrderValue,
        profitMargin: parseFloat(profitMargin.toFixed(2)),
        period: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      },
      topProducts,
      revenueByDay: dailyTrend,
    };
  }

  async remove(id: number): Promise<void> {
    const order = await this.ordersRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    await this.ordersRepository.remove(order);
  }

  private async generateOrderNumber(queryRunner?: QueryRunner): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const count = queryRunner
      ? await queryRunner.manager.count(Order, {
          where: { createdAt: Between(startOfDay, endOfDay) },
        })
      : await this.ordersRepository.count({
          where: { createdAt: Between(startOfDay, endOfDay) },
        });

    const sequence = String(count + 1).padStart(4, "0");
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

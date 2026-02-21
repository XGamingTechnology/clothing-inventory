import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderStatusDto } from "./dto/update-order-status.dto";
import { OrderResponseDto } from "./dto/order-response.dto";

@Controller("orders")
// ⚠️ TODO: Nanti tambah @UseGuards(JwtAuthGuard) kalau JWT sudah ready
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async findAll(): Promise<OrderResponseDto[]> {
    return this.ordersService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number): Promise<OrderResponseDto> {
    return this.ordersService.findOne(id);
  }

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<OrderResponseDto> {
    return this.ordersService.create(createOrderDto);
  }

  @Put(":id/status")
  async updateStatus(@Param("id", ParseIntPipe) id: number, @Body() updateOrderStatusDto: UpdateOrderStatusDto): Promise<OrderResponseDto> {
    return this.ordersService.updateStatus(id, updateOrderStatusDto);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number): Promise<void> {
    return this.ordersService.remove(id);
  }

  @Get("date-range")
  async getOrdersByDateRange(@Query("startDate") startDate: string, @Query("endDate") endDate: string): Promise<OrderResponseDto[]> {
    return this.ordersService.getOrdersByDateRange(new Date(startDate), new Date(endDate));
  }

  // ✅ NEW: Financial Report Endpoint (Tanpa Auth untuk development)
  @Get("reports/financial")
  async getFinancialReport(@Query("startDate") startDate: string, @Query("endDate") endDate: string) {
    // Default: 30 hari terakhir jika tidak ada parameter
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    return this.ordersService.getFinancialReport(start, end);
  }
}

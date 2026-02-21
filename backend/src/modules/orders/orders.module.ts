import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";

// ✅ Import sekali saja
import { ProductsModule } from "../products/products.module";

@Module({
  // ✅ Semua module dependencies harus di dalam imports: []
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    ProductsModule, // ✅ Cukup di sini, tidak di luar
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

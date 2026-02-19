import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { StockModule } from "./modules/stock/stock.module";
import { User } from "./modules/auth/entities/user.entity";
import { Product } from "./modules/products/products.entity";
import { Order } from "./modules/orders/entities/order.entity";
import { OrderItem } from "./modules/orders/entities/order-item.entity";
import { StockMovement } from "./modules/stock/entities/stock-movement.entity";
import { StockIn } from "./modules/stock/entities/stock-in.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    TypeOrmModule.forRoot({
      type: "postgres",
      host: process.env.POSTGRES_HOST || "localhost",
      port: parseInt(process.env.POSTGRES_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || "postgres",
      password: process.env.POSTGRES_PASSWORD || "postgres",
      database: process.env.POSTGRES_DB || "clothing_inventory_dev",
      entities: [User, Product, Order, OrderItem, StockMovement, StockIn],
      synchronize: process.env.NODE_ENV === "development",
      logging: true,
    }),
    AuthModule,
    ProductsModule,
    OrdersModule,
    StockModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

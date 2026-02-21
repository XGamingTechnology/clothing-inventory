import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { StockService } from "./stock.service";
import { StockController } from "./stock.controller";

// ✅ Import entity yang ADA saja
import { StockMovement } from "./entities/stock-movement.entity";
import { StockIn } from "./entities/stock-in.entity";
// ❌ JANGAN import stock-out kalau file-nya tidak ada

// ✅ WAJIB: Import ProductsModule untuk inject ProductsService
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [
    // ✅ Daftar entity yang ada file-nya
    TypeOrmModule.forFeature([StockMovement, StockIn]),

    // ✅ WAJIB: Import ProductsModule agar bisa inject ProductsService
    ProductsModule,
  ],
  providers: [StockService],
  controllers: [StockController],
  exports: [StockService],
})
export class StockModule {}

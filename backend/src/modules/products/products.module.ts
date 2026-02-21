import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "../../modules/products/products.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  providers: [ProductsService],
  controllers: [ProductsController],

  // ✅ WAJIB export agar module lain bisa pakai
  exports: [
    TypeOrmModule.forFeature([Product]),
    ProductsService, // ← Export service-nya
  ],
})
export class ProductsModule {}

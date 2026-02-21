import { IsNotEmpty, IsNumber, Min, IsString, IsOptional } from "class-validator";
import { Type } from "class-transformer"; // ✅ Import ini!

export class CreateOrderItemDto {
  @IsNotEmpty()
  @Type(() => Number) // ✅ WAJIB: Convert string "5" → number 5
  @IsNumber()
  productId: number;

  @IsNotEmpty()
  @Type(() => Number) // ✅ Juga untuk quantity
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

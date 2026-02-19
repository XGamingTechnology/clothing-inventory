import { IsNotEmpty, IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  size?: string;

  @IsOptional()
  @IsString()
  color?: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  hpp: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  stock?: number = 0;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minStock?: number = 5;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;
}

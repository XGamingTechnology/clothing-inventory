export class ProductResponseDto {
  id: number;
  name: string;
  sku: string;
  category?: string;
  size?: string;
  color?: string;
  hpp: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

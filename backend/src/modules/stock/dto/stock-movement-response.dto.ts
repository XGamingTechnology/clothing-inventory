export class StockMovementResponseDto {
  id: number;
  productId: number;
  type: string;
  quantity: number;
  referenceType?: string;
  referenceId?: number;
  notes?: string;
  createdAt: Date;
}

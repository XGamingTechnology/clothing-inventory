import { OrderItem } from '../entities/order-item.entity';

export class OrderResponseDto {
  id: number;
  orderNumber: string;
  customerName?: string;
  customerPhone?: string;
  totalAmount: number;
  totalHpp?: number;
  profit?: number;
  status: string;
  paymentStatus: string;
  notes?: string;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

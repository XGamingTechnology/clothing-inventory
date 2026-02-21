import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  // ✅ Relation only - TypeORM auto-manage order_id column
  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "order_id" }) // ✅ Ini yang bikin kolom order_id di DB
  order: Order;

  // ❌ HAPUS INI: @Column() orderId: number;  <-- Ini yang bikin conflict!

  @Column()
  productId: number;

  @Column()
  productName: string;

  @Column()
  productSku: string;

  @Column({ nullable: true })
  size?: string;

  @Column({ nullable: true })
  color?: string;

  @Column({ type: "int" })
  quantity: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  unitPrice: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  unitHpp: number;

  @Column({ type: "decimal", precision: 12, scale: 2 })
  subtotal: number;

  @Column({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}

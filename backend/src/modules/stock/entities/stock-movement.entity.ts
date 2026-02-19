import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  productId: number;

  @Column()
  type: string;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ nullable: true })
  referenceType?: string;

  @Column({ nullable: true })
  referenceId?: number;

  @Column({ nullable: true, type: 'text' })
  notes?: string;

  @Column({ nullable: true })
  createdBy?: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}

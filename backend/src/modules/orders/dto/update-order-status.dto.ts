import { IsNotEmpty, IsEnum } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(['pending', 'completed', 'cancelled'])
  status: string;
}

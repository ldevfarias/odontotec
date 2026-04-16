import { IsInt, IsPositive } from 'class-validator';

export class CreateBudgetItemDto {
  @IsInt()
  @IsPositive()
  clinicProcedureId: number;

  @IsInt()
  @IsPositive()
  quantity: number;
}

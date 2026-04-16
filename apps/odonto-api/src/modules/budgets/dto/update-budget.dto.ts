import { PartialType } from '@nestjs/swagger';
import { CreateBudgetDto } from './create-budget.dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BudgetStatus } from '../entities/budget.entity';

export class UpdateBudgetDto extends PartialType(CreateBudgetDto) {
  @IsOptional()
  @IsEnum(BudgetStatus)
  status?: BudgetStatus;
}

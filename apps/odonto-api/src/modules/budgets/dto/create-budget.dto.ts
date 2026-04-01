import { IsInt, IsOptional, IsString, IsArray, ValidateNested, ArrayMinSize, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateBudgetItemDto } from './create-budget-item.dto';

export class CreateBudgetDto {
    @IsInt()
    patientId: number;

    @IsOptional()
    @IsString()
    @MaxLength(2000)
    notes?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateBudgetItemDto)
    @ArrayMinSize(1)
    items: CreateBudgetItemDto[];
}

import { IsString, IsNumber, IsOptional, IsEnum, IsArray, ValidateNested, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { TreatmentPlanStatus, TreatmentPlanItemStatus } from '../enums/status.enum';

export class TreatmentPlanItemDto {
    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    id?: number;

    @ApiProperty()
    @IsString()
    @MaxLength(2000)
    description: string;

    @ApiProperty()
    @IsNumber()
    @Type(() => Number)
    value: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    toothNumber?: number;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    surface?: string | null;

    @ApiProperty({ enum: TreatmentPlanItemStatus, required: false })
    @IsEnum(TreatmentPlanItemStatus)
    @IsOptional()
    status?: TreatmentPlanItemStatus;
}

export class CreateTreatmentPlanDto {
    @ApiProperty()
    @IsNumber()
    patientId: number;

    @ApiProperty()
    @IsNumber()
    dentistId: number;

    @ApiProperty({ required: false })
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    discount?: number;



    @ApiProperty({ enum: TreatmentPlanStatus, required: false })
    @IsEnum(TreatmentPlanStatus)
    @IsOptional()
    status?: TreatmentPlanStatus;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    notes?: string;

    @ApiProperty({ type: [TreatmentPlanItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => TreatmentPlanItemDto)
    items: TreatmentPlanItemDto[];
}

export class UpdateTreatmentPlanDto extends PartialType(CreateTreatmentPlanDto) { }

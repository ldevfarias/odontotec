import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClinicProcedureDto {
    @ApiProperty({ example: 'Limpeza e Profilaxia' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({ example: 'Limpeza completa dos dentes', required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ example: 'Preventivo', required: false })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiProperty({ example: 150.00 })
    @IsNumber()
    baseValue: number;

    @ApiProperty({ example: 'FACE', enum: ['FACE', 'TOOTH', 'GENERAL'], required: false })
    @IsString()
    @IsOptional()
    selectionMode?: string;
}

export class UpdateClinicProcedureDto extends PartialType(CreateClinicProcedureDto) { }

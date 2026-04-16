import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateClinicProcedureDto {
  @ApiProperty({ example: 'Limpeza e Profilaxia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Limpeza completa dos dentes', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({ example: 'Preventivo', required: false })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiProperty({ example: 150.0 })
  @IsNumber()
  baseValue: number;

  @ApiProperty({
    example: 'FACE',
    enum: ['FACE', 'TOOTH', 'GENERAL'],
    required: false,
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  selectionMode?: string;
}

export class UpdateClinicProcedureDto extends PartialType(
  CreateClinicProcedureDto,
) {}

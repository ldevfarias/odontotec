import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsOptional,
  MaxLength,
} from 'class-validator';

export class CreateToothObservationDto {
  @ApiProperty({ example: '11' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  toothNumber: string;

  @ApiPropertyOptional({ example: 'O,M,D' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  toothFaces?: string;

  @ApiProperty({ example: 'Cárie incipiente na face oclusal' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  description: string;

  @ApiProperty({ example: '2026-04-04' })
  @IsDateString()
  @IsNotEmpty()
  date: string;

  @ApiProperty({ example: 42 })
  @IsNumber()
  @IsNotEmpty()
  patientId: number;
}

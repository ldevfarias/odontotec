import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    ArrayMaxSize,
    IsArray,
    IsDefined,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    MaxLength,
    ValidateNested,
} from 'class-validator';

export class AnamnesisAnswerDto {
  @ApiProperty({ example: 'hypertension' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  questionId: string;

  @ApiProperty({ example: true })
  @IsDefined()
  value: unknown;

  @ApiProperty({ example: 'Controlada com medicação', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  details?: string;
}

export class AnamnesisDataDto {
  @ApiProperty({ type: [AnamnesisAnswerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnamnesisAnswerDto)
  @ArrayMaxSize(100)
  answers: AnamnesisAnswerDto[];
}

export class CreateAnamnesisDto {
  @ApiProperty({ example: 'Toothache in the lower right molar' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  complaint: string;

  @ApiProperty({ type: AnamnesisDataDto })
  @ValidateNested()
  @Type(() => AnamnesisDataDto)
  data: AnamnesisDataDto;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  patientId: number;
}

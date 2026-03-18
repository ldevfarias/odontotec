import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray, ValidateNested, IsDefined } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AnamnesisAnswerDto {
    @ApiProperty({ example: 'hypertension' })
    @IsString()
    @IsNotEmpty()
    questionId: string;

    @ApiProperty({ example: true })
    @IsDefined()
    value: any;

    @ApiProperty({ example: 'Controlada com medicação', required: false })
    @IsOptional()
    @IsString()
    details?: string;
}

export class AnamnesisDataDto {
    @ApiProperty({ type: [AnamnesisAnswerDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnamnesisAnswerDto)
    answers: AnamnesisAnswerDto[];
}

export class CreateAnamnesisDto {
    @ApiProperty({ example: 'Toothache in the lower right molar' })
    @IsString()
    @IsNotEmpty()
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

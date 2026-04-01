import { IsNotEmpty, IsNumber, IsString, IsDateString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProcedureDto {
    @ApiProperty({ example: 'Root Canal Treatment', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(2000)
    description?: string;

    @ApiProperty({ example: 'Restoration', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    type?: string;

    @ApiProperty({ example: '2023-10-27T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 1500.00, required: false })
    @IsNumber()
    @IsOptional()
    cost?: number;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    patientId: number;

    @ApiProperty({ example: '11', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    toothNumber?: string;

    @ApiProperty({ example: 'O,M,D', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(100)
    toothFaces?: string;
}

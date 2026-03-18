import { IsEnum, IsNumber, IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DocumentType } from '../entities/patient-document.entity';

export class CreatePatientDocumentDto {
    @ApiProperty({ enum: DocumentType })
    @IsEnum(DocumentType)
    @IsNotEmpty()
    type: DocumentType;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    title: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    content: string;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    patientId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    dentistId: number;
}

export class UpdatePatientDocumentDto {
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    title?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    content?: string;
}

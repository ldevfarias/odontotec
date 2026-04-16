import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { AppointmentStatus } from '../entities/appointment.entity';

export class CreateAppointmentDto {
    @ApiProperty({ example: '2026-01-20T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @IsOptional()
    @Min(15)
    duration?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    dentistId: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    patientId: number;
}

export class CreateAppointmentWithPatientDto {
    @ApiProperty({ example: 'João Silva' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    patientName: string;

    @ApiProperty({ example: '(11) 99999-9999' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(20)
    patientPhone: string;

    @ApiProperty({ example: '2026-01-20T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 30 })
    @IsNumber()
    @IsOptional()
    @Min(15)
    duration?: number;

    @ApiProperty()
    @IsNumber()
    @IsNotEmpty()
    dentistId: number;
}

export class UpdateAppointmentDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsDateString()
    date?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    duration?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    dentistId?: number;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsNumber()
    patientId?: number;

    @ApiProperty({ required: false, enum: AppointmentStatus })
    @IsOptional()
    @IsEnum(AppointmentStatus)
    status?: AppointmentStatus;

    @ApiProperty({ required: false, enum: ['PATIENT', 'CLINIC'] })
    @IsOptional()
    @IsEnum(['PATIENT', 'CLINIC'])
    cancelledBy?: 'PATIENT' | 'CLINIC';

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    cancellationReason?: string;
}

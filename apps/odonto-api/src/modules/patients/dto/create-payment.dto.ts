import { IsNotEmpty, IsNumber, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../entities/payment.entity';

export class CreatePaymentDto {
    @ApiProperty({ example: 250.00 })
    @IsNumber()
    @IsNotEmpty()
    amount: number;

    @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    method: PaymentMethod;

    @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING, required: false })
    @IsEnum(PaymentStatus)
    @IsNotEmpty()
    status: PaymentStatus;

    @ApiProperty({ example: '2023-10-27T10:00:00Z' })
    @IsDateString()
    @IsNotEmpty()
    date: string;

    @ApiProperty({ example: 1 })
    @IsNumber()
    @IsNotEmpty()
    patientId: number;

    @ApiProperty({ example: 1, required: false })
    @IsNumber()
    @IsOptional()
    treatmentPlanId?: number;
}

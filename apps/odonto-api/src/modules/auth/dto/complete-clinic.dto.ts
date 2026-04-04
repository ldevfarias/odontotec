import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CompleteClinicDto {
    @ApiProperty({ description: 'The name of the clinic' })
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(255)
    clinicName: string;

    @ApiProperty({ description: 'The phone number of the clinic', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(20)
    clinicPhone?: string;

    @ApiProperty({ description: 'The address of the clinic', required: false })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    clinicAddress?: string;
}

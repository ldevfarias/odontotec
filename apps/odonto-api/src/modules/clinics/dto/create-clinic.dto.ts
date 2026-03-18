import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClinicDto {
    @ApiProperty({ description: 'The name of the clinic' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The phone number of the clinic', required: false })
    @IsOptional()
    @IsString()
    phone?: string;

    @ApiProperty({ description: 'The address of the clinic', required: false })
    @IsOptional()
    @IsString()
    address?: string;
}

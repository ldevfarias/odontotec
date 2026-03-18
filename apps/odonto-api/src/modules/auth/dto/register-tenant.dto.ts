import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
    @ApiProperty({ description: 'The name of the user (admin)' })
    @IsNotEmpty()
    @IsString()
    userName: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'The name of the clinic' })
    @IsNotEmpty()
    @IsString()
    clinicName: string;

    @ApiProperty({ description: 'The phone number of the clinic', required: false })
    @IsOptional()
    @IsString()
    clinicPhone?: string;

    @ApiProperty({ description: 'The address of the clinic', required: false })
    @IsOptional()
    @IsString()
    clinicAddress?: string;
}

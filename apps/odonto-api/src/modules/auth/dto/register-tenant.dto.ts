import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterTenantDto {
    @ApiProperty({ description: 'The name of the user (admin)' })
    @IsNotEmpty()
    @IsString()
    @MaxLength(255)
    userName: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsNotEmpty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty({ description: 'The password of the user' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    @MaxLength(128)
    password: string;

    @ApiProperty({ description: 'The name of the clinic' })
    @IsNotEmpty()
    @IsString()
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

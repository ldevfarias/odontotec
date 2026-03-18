import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitiateRegistrationDto {
    @ApiProperty({ description: 'The name of the user' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'The email of the user' })
    @IsNotEmpty()
    @IsEmail()
    email: string;
}

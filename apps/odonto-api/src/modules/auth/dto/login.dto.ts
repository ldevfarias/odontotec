import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class LoginDto {
    @ApiProperty({ example: 'dentist@example.com', format: 'email' })
    @Transform(({ value }) => value?.trim())
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsNotEmpty()
    @MinLength(6)
    password: string;
}

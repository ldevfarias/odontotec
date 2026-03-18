import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
    @ApiProperty({ description: 'The verification token sent via email' })
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({ description: 'The new password for the account' })
    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({ description: 'Confirm the new password' })
    @IsNotEmpty()
    @IsString()
    confirmPassword: string;
}

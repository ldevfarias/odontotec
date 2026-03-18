import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
    @ApiProperty({ description: 'The reset token sent via email' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ example: 'newStrongPassword123', description: 'The new password', minLength: 6 })
    @IsString()
    @MinLength(6)
    password: string;
}

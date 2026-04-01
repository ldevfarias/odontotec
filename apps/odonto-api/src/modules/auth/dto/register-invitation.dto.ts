import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterInvitationDto {
    @ApiProperty({ example: 'uuid-token-here' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    token: string;

    @ApiProperty({ example: 'John Doe' })
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty({ example: 'password123', minLength: 6 })
    @IsString()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(128)
    password: string;
}

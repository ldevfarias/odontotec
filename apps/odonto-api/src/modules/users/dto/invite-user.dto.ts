import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { UserRole } from '../enums/role.enum';
import { ApiProperty } from '@nestjs/swagger';

export class InviteUserDto {
    @ApiProperty({ example: 'professional@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ example: '123.456.789-00' })
    @IsString()
    @IsNotEmpty()
    cpf: string;

    @ApiProperty({ enum: UserRole, example: UserRole.DENTIST })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

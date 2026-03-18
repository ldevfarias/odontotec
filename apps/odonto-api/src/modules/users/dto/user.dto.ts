import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MinLength } from 'class-validator';
import { UserRole } from '../../users/enums/role.enum';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    name: string;

    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    password: string;

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    role: UserRole;

    // clinicId is extracted from JWT or passed by service

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?: boolean;

    @ApiProperty({ required: false })
    @IsOptional()
    termsAcceptedAt?: Date;
}

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false, enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?: boolean;
}

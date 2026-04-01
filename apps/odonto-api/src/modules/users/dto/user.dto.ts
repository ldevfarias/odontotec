import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';
import { UserRole } from '../../users/enums/role.enum';

export class CreateUserDto {
    @ApiProperty()
    @IsNotEmpty()
    @MaxLength(255)
    name: string;

    @ApiProperty()
    @IsEmail()
    @MaxLength(255)
    email: string;

    @ApiProperty()
    @IsNotEmpty()
    @MinLength(6)
    @MaxLength(128)
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
    @MaxLength(255)
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    @MaxLength(255)
    email?: string;

    @ApiProperty({ required: false, enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiProperty({ required: false })
    @IsOptional()
    isActive?: boolean;
}

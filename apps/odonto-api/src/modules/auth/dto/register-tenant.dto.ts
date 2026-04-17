import { ApiProperty } from '@nestjs/swagger';
import {
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';

const PASSWORD_COMPLEXITY_MESSAGE =
  'A senha deve conter ao menos uma letra maiúscula, um número ou um caractere especial.';

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
  @MinLength(8)
  @MaxLength(128)
  @Matches(/(?=.*[A-Z])|(?=.*[0-9])|(?=.*[^a-zA-Z0-9])/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  password: string;

  @ApiProperty({ description: 'The name of the clinic' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  clinicName: string;

  @ApiProperty({
    description: 'The phone number of the clinic',
    required: false,
  })
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

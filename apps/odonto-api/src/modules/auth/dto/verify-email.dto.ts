import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const PASSWORD_COMPLEXITY_MESSAGE =
  'A senha deve conter ao menos uma letra maiúscula, um número ou um caractere especial.';

export class VerifyEmailDto {
  @ApiProperty({ description: 'The verification token sent via email' })
  @IsNotEmpty()
  @IsString()
  token: string;

  @ApiProperty({
    description: 'The new password for the account',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/(?=.*[A-Z])|(?=.*[0-9])|(?=.*[^a-zA-Z0-9])/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  password: string;

  @ApiProperty({
    description: 'Confirm the new password',
    minLength: 8,
    maxLength: 128,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  confirmPassword: string;
}

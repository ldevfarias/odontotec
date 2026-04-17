import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PASSWORD_COMPLEXITY_MESSAGE =
  'A senha deve conter ao menos uma letra maiúscula, um número ou um caractere especial.';

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

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/(?=.*[A-Z])|(?=.*[0-9])|(?=.*[^a-zA-Z0-9])/, {
    message: PASSWORD_COMPLEXITY_MESSAGE,
  })
  password: string;
}

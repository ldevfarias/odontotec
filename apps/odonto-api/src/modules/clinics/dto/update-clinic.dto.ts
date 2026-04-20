import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { IsValidCnpj } from '../../../common/validators/is-valid-cnpj.validator';

export class UpdateClinicDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsEmail()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsValidCnpj()
  cnpj?: string;
}

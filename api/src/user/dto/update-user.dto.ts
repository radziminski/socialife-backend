import { IsString, IsEmail, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  first_name: string;

  @IsString()
  @IsOptional()
  last_name: string;
}

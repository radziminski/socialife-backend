import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { PASSWORD_REGEX } from '../../constants';

export class RegisterDto {
  @IsEmail()
  @IsString()
  email: string;

  @MinLength(8, {
    message: 'Password should be at least 8 characters long',
  })
  @MaxLength(20, {
    message: 'Password should be maximum 20 characters long',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password should contain at least one lowercase and uppercase letter',
  })
  password: string;

  @IsString()
  @IsOptional()
  firstName: string;

  @IsString()
  @IsOptional()
  lastName: string;
}

import { PASSWORD_REGEX } from './../../constants';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  email: string;

  @IsString()
  password: string;

  @IsString()
  @MinLength(8, {
    message: 'Password should be at least 8 characters long',
  })
  @MaxLength(50, {
    message: 'Password should be maximum 50 characters long',
  })
  @Matches(PASSWORD_REGEX, {
    message:
      'Password should contain at least one lowercase and uppercase letter',
  })
  new_password: string;
}

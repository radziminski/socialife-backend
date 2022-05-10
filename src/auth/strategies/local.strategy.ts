import { UserRole } from './../roles/user-role.enum';
import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Request, Injectable, UnauthorizedException } from '@nestjs/common';

import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<{ email: string }> {
    const validatedUser = await this.authService.validateUser({
      email,
      password,
    });

    if (!validatedUser) {
      throw new UnauthorizedException({
        status: 401,
        message: 'Password incorrect or User does not exist.',
      });
    }

    return { ...validatedUser };
  }
}

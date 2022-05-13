import { RequestUser } from './../auth.types';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';

import { JWT_SECRET } from './../../constants';
import { AuthService } from './../auth.service';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  async validate(payload: {
    email: string;
    sub: number;
  }): Promise<RequestUser> {
    const user = await this.authService.getUser(payload.sub);

    return {
      id: user.id,
      email: user.email,
      role: user.role,
    };
  }
}

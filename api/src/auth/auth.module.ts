import { EncryptionModule } from './../encryption/encryption.module';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_EXPIRATION_S, JWT_SECRET } from '../constants';
import { LocalStrategy } from './strategies/local.strategy';
import { UserModule } from '../user/user.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: JWT_SECRET,
        signOptions: { expiresIn: JWT_EXPIRATION_S },
      }),
    }),
    EncryptionModule,
    UserModule,
    PassportModule,
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
})
export class AuthModule {
  constructor(private authService: AuthService) {
    void authService.createAdminUser();
  }
}

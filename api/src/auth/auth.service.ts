import { UserRole } from './roles/user-role.enum';
import { EncryptionService } from './../encryption/encryption.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserService } from '../user/user.service';
import { LoginCredentials } from './types';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly encryptionService: EncryptionService,
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(credentials: LoginCredentials) {
    const { email, password } = credentials;
    const foundUser = await this.userService.findOneWithPwdByEmail(
      email.toLowerCase(),
    );

    if (
      !(
        foundUser &&
        (await this.encryptionService.compare(password, foundUser.password))
      )
    )
      throw new UnauthorizedException();

    return { id: foundUser.id, email: foundUser.email, roles: foundUser.roles };
  }

  getToken(user: { email: string; id: number }) {
    const payload = { email: user.email.toLowerCase(), sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getUser(id: number) {
    const user = await this.userService.findOne(id);

    if (!user)
      throw new UnauthorizedException({ message: 'User does not exist.' });

    return user;
  }

  async getUserByEmail(email: string) {
    const user = await this.userService.findOneByEmail(email.toLowerCase());

    if (!user)
      throw new UnauthorizedException({ message: 'User does not exist.' });

    return user;
  }

  async createUser(user: {
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
  }) {
    const { email, password, firstName, lastName } = user;
    const hashedPassword = await this.encryptionService.hash(password);

    const created = await this.userService.createWithProfile(
      {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      {
        firstName,
        lastName,
      },
    );

    return {
      ...created,
      password: undefined,
    };
  }

  async createAdminUser() {
    const email = ADMIN_EMAIL;
    const hashedPassword = await this.encryptionService.hash(ADMIN_PASSWORD);

    const created = await this.userService.createWithProfile(
      {
        email: email.toLowerCase(),
        password: hashedPassword,
        roles: [UserRole.User, UserRole.Admin, UserRole.Editor],
      },
      {
        firstName: 'Admin',
        lastName: 'User',
      },
    );

    return {
      ...created,
      password: undefined,
    };
  }
}

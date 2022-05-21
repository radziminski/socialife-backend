import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

import { UserRole } from './roles/user-role.enum';
import { UserService } from '../user/user.service';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../constants';
import { LoginCredentials } from './auth.types';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async bcryptHash(plaintext: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(plaintext, saltOrRounds);
    return hash;
  }

  async bcryptCompare(plaintext: string, hash: string) {
    return bcrypt.compare(plaintext, hash);
  }

  async validateUser(credentials: LoginCredentials) {
    const { email, password } = credentials;
    const foundUser = await this.userService.findOneWithPwdByEmail(
      email.toLowerCase(),
    );

    if (
      !(foundUser && (await this.bcryptCompare(password, foundUser.password)))
    )
      throw new UnauthorizedException();

    return { id: foundUser.id, email: foundUser.email, roles: foundUser.role };
  }

  getToken(user: { email: string; id: number }) {
    const payload = { email: user.email.toLowerCase(), sub: user.id };

    return {
      accessToken: this.jwtService.sign(payload),
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

  async createUser(user: RegisterDto, isOrganization?: boolean) {
    const { email, password } = user;
    const hashedPassword = await this.bcryptHash(password);

    const created = await this.userService.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: isOrganization ? UserRole.Organization : UserRole.User,
    });

    return {
      ...created,
      password: undefined,
    };
  }

  async updatePassword(userEmail: string, newPassword: string) {
    const hashedPassword = await this.bcryptHash(newPassword);

    return this.userService.updatePassword(userEmail, {
      password: hashedPassword,
    });
  }

  async createAdminUser() {
    const email = ADMIN_EMAIL;
    const hashedPassword = await this.bcryptHash(ADMIN_PASSWORD);

    const created = await this.userService.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.Admin,
    });

    return {
      ...created,
      password: undefined,
    };
  }
}

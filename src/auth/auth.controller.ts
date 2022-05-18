import { ChangePasswordDto } from './dto/change-password.dto';
import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  BadRequestException,
  Patch,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RequestWithUser } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: RequestWithUser) {
    return this.authService.getToken(req.user);
  }

  @UseGuards(LocalAuthGuard, JwtAuthGuard)
  @Patch('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req: RequestWithUser,
    @Body() body: ChangePasswordDto,
  ) {
    await this.authService.updatePassword(req.user.email, body.newPassword);

    return {
      message: 'Password changed.',
    };
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.userService.findOneByEmail(
      registerDto.email.toLowerCase(),
      false,
    );

    if (user)
      throw new BadRequestException({
        message: 'The user with given email already exists.',
      });

    const { email, password } = registerDto;

    try {
      const user = await this.authService.createUser({
        email,
        password,
      });

      const tokens = this.authService.getToken({
        email: user.email,
        id: user.id,
      });

      return { user, tokens };
    } catch (error) {
      throw new BadRequestException({ error });
    }
  }

  @Post('register-organization')
  async registerOrganization(@Body() registerDto: RegisterDto) {
    const user = await this.userService.findOneByEmail(
      registerDto.email.toLowerCase(),
      false,
    );

    if (user)
      throw new BadRequestException({
        message: 'The organization with given email already exists.',
      });

    const { email, password } = registerDto;

    try {
      const user = await this.authService.createUser(
        {
          email,
          password,
        },
        true,
      );

      const tokens = this.authService.getToken({
        email: user.email,
        id: user.id,
      });

      return { user, tokens };
    } catch (error) {
      throw new BadRequestException({ error });
    }
  }
}

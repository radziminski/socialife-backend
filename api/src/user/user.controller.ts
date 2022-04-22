import { RolesGuard } from './../auth/guards/user-roles.guard';
import { UserRole } from './../auth/roles/user-role.enum';
import { Roles } from './../auth/roles/roles.decorator';
import { RequestWithUser } from './../auth/types/index';
import { JwtAuthGuard } from './../auth/guards/jwt-auth.guard';
import {
  Controller,
  Get,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Editor)
  @Get('all')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req: RequestWithUser) {
    return this.userService.findOneByEmail(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Patch()
  updateMe(
    @Request() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.userService.updateOne(req.user.email, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(@Request() req: RequestWithUser) {
    await this.userService.removeByEmail(req.user.email);
    return;
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeUser(@Param('id') id: number) {
    await this.userService.remove(id);
    return;
  }
}

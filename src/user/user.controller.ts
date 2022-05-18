import { RolesGuard } from './../auth/guards/user-roles.guard';
import { UserRole } from './../auth/roles/user-role.enum';
import { Roles } from './../auth/roles/roles.decorator';
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
  Post,
} from '@nestjs/common';

import { UserService } from './user.service';
import { RequestWithUser } from '../auth/auth.types';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateOrganizationProfileDto } from './dto/create-organization-profile.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin)
  @Get('all')
  async getAllUsers() {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  getMe(@Request() req: RequestWithUser) {
    return this.userService.findOneByEmailWithUnifiedProfile(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return this.userService.getProfile(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  @HttpCode(HttpStatus.CREATED)
  createProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfile: CreateProfileDto | CreateOrganizationProfileDto,
  ) {
    return this.userService.createProfile(
      req.user.email,
      req.user.role,
      updateProfile,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  updateProfile(
    @Request() req: RequestWithUser,
    @Body() updateProfile: UpdateProfileDto | UpdateOrganizationProfileDto,
  ) {
    return this.userService.updateProfile(
      req.user.email,
      req.user.role,
      updateProfile,
    );
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

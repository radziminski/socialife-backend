import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EventService } from './event.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/roles/roles.decorator';
import { UserRole } from '../auth/roles/user-role.enum';
import { RequestWithUser } from '../auth/auth.types';
import { RolesGuard } from '../auth/guards/user-roles.guard';

@Controller('event')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createEventDto: CreateEventDto,
  ) {
    return this.eventService.create(req.user.email, createEventDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.eventService.findAll(req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Get('/mine')
  findMine(@Request() req: RequestWithUser) {
    return this.eventService.findAllForOrganization(req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventService.findOneWithFirstLikes(+id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.eventService.update(+id, req.user.email, updateEventDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.remove(+id, req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Patch(':id/cancel')
  cancel(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.cancel(+id, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @HttpCode(HttpStatus.OK)
  likeEvent(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.likeEvent(+id, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/unlike')
  @HttpCode(HttpStatus.OK)
  unLikeEvent(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.eventService.unlikeEvent(+id, req.user.email);
  }
}

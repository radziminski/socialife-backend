import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TicketService } from './ticket.service';
import { CreateTicketTypeDto } from './dto/create-ticket-type.dto';
import { RequestWithUser } from '../auth/auth.types';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/user-roles.guard';
import { Roles } from 'src/auth/roles/roles.decorator';
import { UserRole } from 'src/auth/roles/user-role.enum';
import { UpdateTicketTypeDto } from './dto/update-ticket-type.dto';
import { ValidateTicketDto } from './dto/validate-ticket.dto';

@Controller('event-ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':eventId/type')
  findTypesForEvent(@Param('eventId') eventId: string) {
    return this.ticketService.findTypesForEvent(+eventId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Post(':eventId/type')
  createType(
    @Request() req: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() createTicketDto: CreateTicketTypeDto,
  ) {
    return this.ticketService.createType(
      +eventId,
      req.user.email,
      createTicketDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Patch(':eventId/type/:id')
  updateType(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
    @Body() updateTicketTypeDto: UpdateTicketTypeDto,
  ) {
    return this.ticketService.updateType(
      +id,
      +eventId,
      req.user.email,
      updateTicketTypeDto,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Delete(':eventId/type/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeType(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    await this.ticketService.deleteType(+id, +eventId, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('instance/:id')
  getOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.ticketService.checkOwnerAndFindOne(+id, req.user.email);
  }

  @UseGuards(JwtAuthGuard)
  @Get('instance')
  getUserTickets(@Request() req: RequestWithUser) {
    return this.ticketService.findUserTickets(req.user.email);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Post(':eventId/validate/')
  @HttpCode(HttpStatus.ACCEPTED)
  checkTicketValidity(
    @Request() req: RequestWithUser,
    @Param('eventId') eventId: string,
    @Body() validateTicketDto: ValidateTicketDto,
  ) {
    return this.ticketService.checkTicketValidity(
      req.user.email,
      +eventId,
      validateTicketDto.ticketTypeId,
      validateTicketDto.ticketId,
      validateTicketDto.ticketSecret,
    );
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.Admin, UserRole.Organization)
  @Get(':eventId/stats')
  getStats(@Request() req: RequestWithUser, @Param('eventId') eventId: string) {
    return this.ticketService.getStats(+eventId, req.user.email);
  }
}

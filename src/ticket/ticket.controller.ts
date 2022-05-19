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

@Controller('event/ticket')
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

  @UseGuards(JwtAuthGuard)
  @Patch(':eventId/type/:id')
  update(
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

  @UseGuards(JwtAuthGuard)
  @Delete(':eventId/type/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Param('eventId') eventId: string,
  ) {
    await this.ticketService.deleteType(+id, +eventId, req.user.email);
  }
}

import { IsNumber, IsString } from 'class-validator';

export class ValidateTicketDto {
  @IsNumber()
  ticketTypeId;

  @IsNumber()
  ticketId;

  @IsString()
  ticketSecret;
}

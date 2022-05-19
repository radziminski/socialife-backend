import { PartialType } from '@nestjs/mapped-types';
import { CreateTicketTypeDto } from './create-ticket-type.dto';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateTicketTypeDto extends PartialType(CreateTicketTypeDto) {
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}

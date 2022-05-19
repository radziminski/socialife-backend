import { Type } from 'class-transformer';
import {
  IsEnum,
  ArrayMinSize,
  IsArray,
  IsNumberString,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentMethod } from '../payment-method.enum';

export class PaymentTicket {
  ticketTypeId: number;
  amount: number;
}

export class CreatePaymentDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => PaymentTicket)
  tickets: PaymentTicket[];

  @IsString()
  bankName: string;

  @IsNumberString()
  lastFourDigits: string;

  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;
}

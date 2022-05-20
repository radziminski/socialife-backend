import { Type } from 'class-transformer';
import {
  IsEnum,
  ArrayMinSize,
  IsArray,
  IsNumberString,
  IsString,
  ValidateNested,
  IsNumber,
  IsInt,
  IsPositive,
} from 'class-validator';
import { PaymentMethod } from '../payment-method.enum';

export class PaymentTicket {
  @IsNumber()
  ticketTypeId: number;

  @IsInt()
  @IsPositive()
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

import { PickType } from '@nestjs/mapped-types';
import { CreatePaymentDto } from './create-payment.dto';

export class GetPotentialPaymentDto extends PickType(CreatePaymentDto, [
  'tickets',
  'paymentMethod',
]) {}

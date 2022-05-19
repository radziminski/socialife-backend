import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetPotentialPaymentDto } from './dto/get-potential-payment.dto';
import { RequestWithUser } from '../auth/auth.types';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/calculate')
  getPotentialPayment(@Body() getPotentialPaymentDto: GetPotentialPaymentDto) {
    return this.paymentService.getPotentialPayment(getPotentialPaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  makePayment(
    @Request() req: RequestWithUser,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    return this.paymentService.create(req.user.email, createPaymentDto);
  }
}

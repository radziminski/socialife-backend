import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TicketModule } from '../ticket/ticket.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), TicketModule, UserModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}

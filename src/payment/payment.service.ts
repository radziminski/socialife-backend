import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { GetPotentialPaymentDto } from './dto/get-potential-payment.dto';
import { Payment } from './entities/payment.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm/repository/Repository';
import { TicketService } from '../ticket/ticket.service';
import { FEE_FOR_PAYMENT_METHOD, VAT_PERCENT } from './payment.constant';
import { UserService } from '../user/user.service';
import { PaymentStatus } from './payment-status.enum';
import { Ticket } from '../ticket/entities/ticket.entity';
import {
  PotentialPaymentDto,
  TicketPriceDto,
} from './dto/potential-payment.dto';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly ticketService: TicketService,
    private readonly userService: UserService,
  ) {}

  async getPotentialPayment(
    getPotentialPayment: GetPotentialPaymentDto,
  ): Promise<PotentialPaymentDto> {
    const { tickets, paymentMethod } = getPotentialPayment;
    let netPrice = 0;
    const ticketPrices: TicketPriceDto[] = [];

    const ticketTypes = await Promise.all(
      tickets.map(({ ticketTypeId }) =>
        this.ticketService.findOneType(ticketTypeId),
      ),
    );

    for (const ticket of ticketTypes) {
      const { amount } = tickets.filter(
        ({ ticketTypeId }) => ticketTypeId === ticket.id,
      )[0];
      netPrice += amount * ticket.price;
      ticketPrices.push({
        price: amount * ticket.price,
        ticketTypeId: ticket.id,
      });
    }

    const feesType = FEE_FOR_PAYMENT_METHOD[paymentMethod];
    const fees =
      feesType.type === 'constant'
        ? feesType.amount
        : (feesType.amount / 100) * netPrice;
    const vat = netPrice * (VAT_PERCENT / 100);
    const totalPrice = netPrice + fees + vat;

    return {
      netPrice,
      fees,
      vat,
      totalPrice,
      ticketPrices,
    };
  }

  async create(email: string, createPaymentDto: CreatePaymentDto) {
    const user = await this.userService.findOneByEmail(email);
    const paymentDetails = await this.getPotentialPayment(createPaymentDto);
    const { netPrice, fees, vat, totalPrice } = paymentDetails;

    const payment = new Payment();
    payment.author = user.profile;
    payment.bankName = createPaymentDto.bankName;
    payment.fees = fees;
    payment.lastFourDigits = createPaymentDto.lastFourDigits;
    payment.method = createPaymentDto.paymentMethod;
    payment.netPrice = netPrice;
    payment.totalPrice = totalPrice;
    payment.status = PaymentStatus.Processing;
    payment.vat = vat;

    const tickets: Ticket[] = [];

    for (const ticket of createPaymentDto.tickets) {
      for (let ticketNum = 0; ticketNum < ticket.amount; ticketNum++) {
        const newTicket = await this.ticketService.createTicket(
          user.profile,
          ticket.ticketTypeId,
        );
        tickets.push(newTicket);
      }
    }

    payment.tickets = tickets;
    const newPayment = await this.paymentRepository.save(payment);

    if (Math.random() > 0.5) {
      newPayment.status = PaymentStatus.Paid;
    } else {
      void this.processPayment(newPayment.id);
    }

    return newPayment;
  }

  async processPayment(id: number) {
    try {
      await new Promise((res) => setTimeout(res, Math.random() * 30000));
      const payment = this.paymentRepository.findOne(id);
      this.paymentRepository.save({
        ...payment,
        status: PaymentStatus.Paid,
      });
    } catch {}
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} payment`;
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}

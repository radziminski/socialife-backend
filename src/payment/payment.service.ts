import { Injectable, BadRequestException } from '@nestjs/common';
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

  async getPaymentPriceDetails(
    getPotentialPaymentDto: GetPotentialPaymentDto,
  ): Promise<PotentialPaymentDto> {
    const { tickets, paymentMethod } = getPotentialPaymentDto;
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
    const profile = await this.userService.findProfileByEmail(email);
    const paymentDetails = await this.getPaymentPriceDetails(createPaymentDto);
    const { netPrice, fees, vat, totalPrice } = paymentDetails;

    const payment = new Payment();
    payment.author = profile;
    payment.bankName = createPaymentDto.bankName ?? '';
    payment.fees = fees;
    payment.lastFourDigits = createPaymentDto.lastFourDigits ?? '';
    payment.method = createPaymentDto.paymentMethod;
    payment.netPrice = netPrice;
    payment.totalPrice = totalPrice;
    payment.status = PaymentStatus.Processing;
    payment.vat = vat;

    const tickets: Ticket[] = [];

    for (const ticket of createPaymentDto.tickets) {
      for (let ticketNum = 0; ticketNum < ticket.amount; ticketNum++) {
        const newTicket = await this.ticketService.createTicket(
          profile,
          ticket.ticketTypeId,
        );
        tickets.push(newTicket);
      }
    }

    let shouldProcess = false;
    if (Math.random() > 0.5) {
      payment.status = PaymentStatus.Paid;
    } else {
      shouldProcess = true;
    }

    payment.tickets = tickets;
    const newPayment = await this.paymentRepository.save(payment);

    if (shouldProcess) {
      void this.processPayment(newPayment.id);
    }

    return newPayment;
  }

  async processPayment(id: number) {
    try {
      await new Promise((res) => setTimeout(res, Math.random() * 40000));
      const payment = await this.paymentRepository.findOne(id);
      this.paymentRepository.save({
        ...payment,
        status: PaymentStatus.Paid,
      });
    } catch {}
  }

  async getPayment(id: number) {
    const payment = await this.paymentRepository.findOne(id, {
      relations: ['tickets', 'author', 'tickets.type'],
    });

    if (!payment) {
      throw new BadRequestException(`Payment with id ${id} does not exist`);
    }

    return payment;
  }

  async validateUserAndGetPayment(id: number, email: string) {
    const profile = await this.userService.findProfileByEmail(email);
    const payment = await this.getPayment(id);

    if (profile.id !== payment.author.id) {
      throw new BadRequestException(
        `User does not have a payment with od ${id}`,
      );
    }

    const { author: _, ...restPayment } = payment;

    return restPayment;
  }

  async getUserPayments(email: string) {
    const profile = await this.userService.findProfileByEmail(email);
    const payments = await this.paymentRepository.find({
      where: {
        author: {
          id: profile.id,
        },
      },
    });

    return payments;
  }
}

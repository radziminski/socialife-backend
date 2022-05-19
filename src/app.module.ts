import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { REQUESTS_PER_MINUTE_LIMIT, DB_CONFIG } from './constants';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { AppController } from './app.controller';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { APP_GUARD } from '@nestjs/core';
import { EventModule } from './event/event.module';
import { TicketModule } from './ticket/ticket.module';
import { PaymentModule } from './payment/payment.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: REQUESTS_PER_MINUTE_LIMIT,
    }),
    TypeOrmModule.forRoot(DB_CONFIG),
    LoggerModule,
    UserModule,
    AuthModule,
    FileModule,
    EventModule,
    TicketModule,
    PaymentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  controllers: [AppController],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}

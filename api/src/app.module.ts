import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { MiddlewareConsumer, Module } from '@nestjs/common';

import { REQUESTS_PER_MINUTE_LIMIT } from './constants';
import { RequestLoggerMiddleware } from './common/middleware/request-logger.middleware';
import { DatabaseModule } from './database/database.module';
import { AppController } from './app.controller';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { FileModule } from './file/file.module';
import { ProjectModule } from './project/project.module';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: REQUESTS_PER_MINUTE_LIMIT,
    }),
    DatabaseModule,
    LoggerModule,
    UserModule,
    AuthModule,
    FileModule,
    ProjectModule,
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

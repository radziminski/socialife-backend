import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventService } from './event.service';
import { EventController } from './event.controller';
import { Event } from './entities/event.entity';
import { EventLike } from './entities/event-like.entity';
import { EventFile } from './entities/event-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, EventLike, EventFile])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}

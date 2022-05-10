import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';

import { DB_CONFIG } from '../constants';

@Module({
  imports: [TypeOrmModule.forRoot(DB_CONFIG)],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}

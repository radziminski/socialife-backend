import { ProjectModule } from './../project/project.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module, forwardRef } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Profile } from './entities/profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile]),
    forwardRef(() => ProjectModule),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}

import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UserRole } from '../auth/roles/user-role.enum';
import { Profile } from './entities/profile.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(user: { email: string; password: string; role?: UserRole }) {
    return this.userRepository.save({
      ...user,
      role: user.role ?? UserRole.User,
    });
  }

  async createProfile(
    email: string,
    profile: {
      firstName: string;
      lastName?: string;
    },
  ) {
    const userProfile = new Profile();
    userProfile.firstName = profile.firstName;
    userProfile.lastName = profile.lastName;

    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });

    if (!user) throw new BadRequestException({ message: 'User not found' });

    return this.userRepository.save({
      ...user,
      profile: userProfile,
    });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { id },
    });
  }

  async findOneByEmail(email: string, validate = true) {
    const user = await this.userRepository.findOne({
      relations: ['profile'],
      where: { email },
    });

    if (!user && validate)
      throw new BadRequestException({ message: 'User not found' });

    return user;
  }

  async findOneWithPwdByEmail(email: string) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async updateOne(email: string, newUser: UpdateUserDto) {
    const user = await this.findOneByEmail(email);

    return this.userRepository.save({
      ...user,
      profile: { firstName: newUser.first_name, lastName: newUser.last_name },
    });
  }

  async updatePassword(email: string, newUser: { password: string }) {
    const user = await this.findOneByEmail(email);

    return this.userRepository.save({ ...user, password: newUser.password });
  }

  async removeByEmail(email: string) {
    return this.userRepository.delete({ email });
  }

  // ANY USER

  async findAll() {
    return this.userRepository.find();
  }

  async remove(id: number) {
    return this.userRepository.delete(id);
  }
}

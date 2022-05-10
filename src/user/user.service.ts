// import { ProjectService } from './../project/project.service';
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
    private readonly userRepository: Repository<User>, // private readonly projectService: ProjectService,
  ) {}

  async create(user: { email: string; password: string; roles?: string[] }) {
    return this.userRepository.save({
      ...user,
      roles: user.roles ?? [UserRole.User],
    });
  }

  async createWithProfile(
    user: {
      email: string;
      password: string;
      roles?: string[];
    },
    profile: {
      firstName: string;
      lastName: string;
    },
  ) {
    const userProfile = new Profile();
    userProfile.firstName = profile.firstName;
    userProfile.lastName = profile.lastName;

    const createdUser = await this.userRepository.save({
      ...user,
      roles: user.roles ?? [UserRole.User],
      profile: userProfile,
    });

    // await this.projectService.createDemoProject(createdUser.email);

    return createdUser;
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { id },
    });
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { email },
    });
  }

  async findOneWithPwdByEmail(email: string) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { email },
      select: ['id', 'email', 'password', 'roles'],
    });
  }

  async updateOne(email: string, newUser: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
    if (!user) throw new BadRequestException({ message: 'User not found' });

    return this.userRepository.save({
      ...user,
      profile: { firstName: newUser.first_name, lastName: newUser.last_name },
    });
  }

  async updatePassword(email: string, newUser: { password: string }) {
    return this.userRepository.update(email, { password: newUser.password });
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

import { Repository } from 'typeorm/repository/Repository';
import { InjectRepository } from '@nestjs/typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';

import { User } from './entities/user.entity';
import { UserRole } from '../auth/roles/user-role.enum';
import { Profile } from './entities/profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateOrganizationProfileDto } from './dto/create-organization-profile.dto';
import { OrganizationProfile } from './entities/organization-profile.entity';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import {
  isUpdateOrganizationProfileDto,
  isCreateOrganizationProfileDto,
} from './user.utils';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // USERS

  async create(user: { email: string; password: string; role?: UserRole }) {
    return this.userRepository.save({
      ...user,
      role: user.role ?? UserRole.User,
    });
  }

  async findOne(id: number) {
    return this.userRepository.findOne({
      relations: ['profile', 'organizationProfile'],
      where: { id },
    });
  }

  async findOneByEmail(email: string, validate = true) {
    const user = await this.userRepository.findOne({
      relations: ['profile', 'organizationProfile'],
      where: { email },
    });

    if (!user && validate) {
      throw new BadRequestException({ message: 'User not found' });
    }

    return user;
  }

  async findOneByEmailWithLikes(email: string, validate = true) {
    const user = await this.userRepository.findOne({
      relations: ['profile', 'profile.eventLikes', 'organizationProfile'],
      where: { email },
    });

    if (!user && validate) {
      throw new BadRequestException({ message: 'User not found' });
    }

    if (user.organizationProfile || !user.profile) {
      return user;
    }

    const likedEventsNumber = user.profile.eventLikes?.length ?? 0;
    const { eventLikes: _, ...restProfile } = user.profile;

    return {
      ...user,
      profile: {
        ...restProfile,
        likedEventsNumber,
      },
    };
  }

  async findProfileByEmail(email: string, validate = true) {
    const user = await this.findOneByEmail(email, validate);

    if (!user.profile) {
      throw new BadRequestException('User does not have a profile');
    }

    return user.profile;
  }

  async findOneByEmailWithUnifiedProfile(email: string, validate = true) {
    const user = await this.findOneByEmailWithLikes(email, validate);

    const { profile, organizationProfile, ...restUser } = user;

    return user.role === UserRole.Organization
      ? {
          ...restUser,
          organizationProfile,
        }
      : {
          ...restUser,
          profile,
        };
  }

  async findOneWithPwdByEmail(email: string) {
    return this.userRepository.findOne({
      relations: ['profile'],
      where: { email },
      select: ['id', 'email', 'password', 'role'],
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

  // PROFILES

  async getProfile(email: string) {
    const user = await this.findOneByEmail(email);

    const profile = user.profile ?? user.organizationProfile;

    if (!profile) {
      throw new BadRequestException({
        message: 'User does not have a profile',
      });
    }

    return user.profile ?? user.organizationProfile;
  }

  async getProfileWithLikes(email: string) {
    const user = await this.findOneByEmailWithLikes(email);

    const profile = user.profile ?? user.organizationProfile;

    if (!profile) {
      throw new BadRequestException({
        message: 'User does not have a profile',
      });
    }

    return user.profile ?? user.organizationProfile;
  }

  async createProfile(
    email: string,
    role: UserRole,
    profile: CreateProfileDto | CreateOrganizationProfileDto,
  ) {
    if (isCreateOrganizationProfileDto(profile)) {
      if (role !== UserRole.Organization) {
        throw new BadRequestException('User cannot have organization profile');
      }

      return this.createOrganizationProfile(email, profile);
    }

    if (role === UserRole.Organization) {
      throw new BadRequestException('Organization cannot have user profile');
    }

    return this.createUserProfile(email, profile);
  }

  async createUserProfile(email: string, profile: CreateProfileDto) {
    const user = await this.findOneByEmail(email);

    if (user.profile) {
      throw new BadRequestException('User already has profile');
    }

    const userProfile = new Profile();
    userProfile.email = user.email;
    userProfile.firstName = profile.firstName;
    userProfile.lastName = profile.lastName;
    userProfile.region = profile.region;

    return this.userRepository.save({
      ...user,
      profile: userProfile,
    });
  }

  async createOrganizationProfile(
    email: string,
    profile: CreateOrganizationProfileDto,
  ) {
    const organization = await this.findOneByEmail(email);

    if (organization.organizationProfile) {
      throw new BadRequestException('Organization already has profile');
    }

    const organizationProfile = new OrganizationProfile();
    organizationProfile.email = organization.email;
    organizationProfile.name = profile.name;
    organizationProfile.description = profile.description;
    organizationProfile.website = profile.website;
    organizationProfile.region = profile.region;
    organizationProfile.city = profile.city;
    organizationProfile.coverUrl = profile.coverUrl;

    return this.userRepository.save({
      ...organization,
      organizationProfile: organizationProfile,
    });
  }

  async updateProfile(
    email: string,
    role: UserRole,
    newProfile: UpdateProfileDto | UpdateOrganizationProfileDto,
  ) {
    if (isUpdateOrganizationProfileDto(newProfile)) {
      if (role !== UserRole.Organization) {
        throw new BadRequestException(
          'User cannot update organization profile',
        );
      }

      return this.updateOrganizationProfile(email, newProfile);
    }

    if (role === UserRole.Organization) {
      throw new BadRequestException('Organization cannot update user profile');
    }

    return this.updateUserProfile(email, newProfile);
  }

  async updateUserProfile(email: string, newProfile: UpdateProfileDto) {
    const user = await this.findOneByEmail(email);

    return this.userRepository.save({
      ...user,
      profile: { ...user.profile, ...newProfile },
    });
  }

  async updateOrganizationProfile(
    email: string,
    newProfile: UpdateOrganizationProfileDto,
  ) {
    const user = await this.findOneByEmail(email);

    return this.userRepository.save({
      ...user,
      organizationProfile: { ...user.organizationProfile, ...newProfile },
    });
  }

  async checkIfHasProfile(email: string) {
    const user = await this.findOneByEmail(email);

    return Boolean(user.organizationProfile || user.profile);
  }
}

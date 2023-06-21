import { Profile } from './entities/profile.entity';
import { OrganizationProfile } from './entities/organization-profile.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdateOrganizationProfileDto } from './dto/update-organization-profile.dto';
import { CreateProfileDto } from './dto/create-profile.dto';
import { CreateOrganizationProfileDto } from './dto/create-organization-profile.dto';

export const isOrganizationProfile = (
  profile: Profile | OrganizationProfile,
): profile is OrganizationProfile => {
  return Boolean((profile as OrganizationProfile).name);
};

export const isUpdateOrganizationProfileDto = (
  profile: UpdateProfileDto | UpdateOrganizationProfileDto,
): profile is UpdateOrganizationProfileDto =>
  Boolean((profile as UpdateOrganizationProfileDto).name) ||
  Boolean((profile as UpdateOrganizationProfileDto).coverUrl) ||
  Boolean((profile as UpdateOrganizationProfileDto).website) ||
  Boolean((profile as UpdateOrganizationProfileDto).description) ||
  Boolean((profile as UpdateOrganizationProfileDto).city);

export const isCreateOrganizationProfileDto = (
  profile: CreateProfileDto | CreateOrganizationProfileDto,
): profile is CreateOrganizationProfileDto => {
  return Boolean((profile as CreateOrganizationProfileDto).name);
};

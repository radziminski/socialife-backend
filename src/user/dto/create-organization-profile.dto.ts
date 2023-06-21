import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Region } from '../region.enum';

export class CreateOrganizationProfileDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  website: string;

  @IsEnum(Region)
  region: Region;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  coverUrl?: string;
}

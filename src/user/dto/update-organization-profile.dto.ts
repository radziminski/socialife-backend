import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Region } from '../region.enum';

export class UpdateOrganizationProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  website?: string;

  @IsEnum(Region)
  @IsOptional()
  region?: Region;

  @IsString()
  @IsOptional()
  city?: string;
}

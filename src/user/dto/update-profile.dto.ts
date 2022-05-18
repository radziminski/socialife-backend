import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Region } from '../region.enum';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsOptional()
  @IsEnum(Region)
  region?: Region;
}

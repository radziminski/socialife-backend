import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Region } from '../region.enum';

export class CreateProfileDto {
  @IsString()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(Region)
  region: Region;
}

import { IsEnum, IsNumberString, IsOptional, IsString } from 'class-validator';
import { EventCategory } from '../event-category.enum';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  startDate: string;

  @IsString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  locationName?: string;

  @IsString()
  @IsOptional()
  locationRef?: string;

  @IsNumberString()
  longitude: string;

  @IsNumberString()
  latitude: string;

  @IsEnum(EventCategory)
  @IsOptional()
  category: EventCategory;
}

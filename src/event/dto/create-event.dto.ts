import {
  IsEnum,
  IsNumberString,
  IsOptional,
  IsString,
  IsDateString,
  IsArray,
} from 'class-validator';
import { EventCategory } from '../event-category.enum';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  locationName?: string;

  @IsString()
  @IsOptional()
  locationRef?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  externalImageUrls?: string[];

  @IsNumberString()
  longitude: string;

  @IsNumberString()
  latitude: string;

  @IsEnum(EventCategory)
  @IsOptional()
  category: EventCategory;
}

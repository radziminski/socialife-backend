import {
  IsString,
  IsOptional,
  IsNumber,
  IsDateString,
  Min,
  Max,
  MaxLength,
} from 'class-validator';
export class CreateTicketTypeDto {
  @IsString()
  @MaxLength(100)
  title: string;

  @IsString()
  @IsOptional()
  @MaxLength(20000)
  description?: string;

  @IsNumber()
  @Min(100)
  @Max(1000000)
  price: number;

  @IsDateString()
  @IsOptional()
  availableTillDate?: string;
}

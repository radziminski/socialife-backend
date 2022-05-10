import { IsNumber } from 'class-validator';

export class AddProjectFileDto {
  @IsNumber()
  fileId: number;
}

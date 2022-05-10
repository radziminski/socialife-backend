import { IsString } from 'class-validator';

export class AddProjectUserDto {
  @IsString()
  email: string;
}

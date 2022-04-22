import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get('/')
  getTest(): string {
    return 'Api working!';
  }
}

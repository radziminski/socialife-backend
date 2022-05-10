import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { PORT, ASSETS_STORAGE } from './constants';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors();

  if (ASSETS_STORAGE === 'local')
    app.useStaticAssets(join(__dirname, '..', 'files/audio'));

  await app.listen(PORT);
  console.log(`Listening on port ${PORT}...`);
}

void bootstrap();

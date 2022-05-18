import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { API_PORT, ASSETS_STORAGE } from './constants';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as helmet from 'helmet';
import { initSwagger } from './common/swagger/initSwagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  app.use(helmet());
  app.enableCors();

  initSwagger(app);

  if (ASSETS_STORAGE === 'local')
    app.useStaticAssets(join(__dirname, '..', 'files/audio'));

  await app.listen(API_PORT);
  console.log(`Listening on port ${API_PORT}...`);
}

void bootstrap();

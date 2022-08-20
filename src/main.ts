import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import { PORT, ASSETS_STORAGE } from './constants';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as helmet from 'helmet';
import { initSwagger } from './common/swagger/initSwagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );
  app.use(helmet());
  app.enableCors();

  initSwagger(app);

  if (ASSETS_STORAGE === 'local')
    app.useStaticAssets(join(__dirname, '..', 'files/audio'));

  const port = PORT ?? 8080;
  await app.listen(port);
  console.log(`Listening on port ${port}...`);
}

void bootstrap();

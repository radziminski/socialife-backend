import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VERSION } from '../../constants';

export const initSwagger = (app: NestExpressApplication) => {
  const config = new DocumentBuilder()
    .setTitle('Socialife Backend')
    .setDescription('Backend for socialife app')
    .setVersion(VERSION)
    .addTag('socialife')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
};

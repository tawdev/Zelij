import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  app.set('trust proxy', 1);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }));

  const port = process.env.PORT || 3002;
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

  // Désactive CORS dans NestJS en production pour éviter les doublons avec Nginx.
  if (process.env.NODE_ENV !== 'production') {
    app.enableCors({
      origin: true,
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
    });
  }

  await app.listen(port);
  console.log(`Backend running on port ${port}`);
}
bootstrap();

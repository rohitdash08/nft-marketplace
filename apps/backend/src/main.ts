/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

import { AppModule } from './app/app.module';

async function bootstrap() {
  // Load environment variables
  dotenv.config();

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin:'http://localhost:4200', // Adjust this to your frontend URL
    methods: ['GET,HEAD,PUT,PATCH,POST,DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });
  
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);

  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
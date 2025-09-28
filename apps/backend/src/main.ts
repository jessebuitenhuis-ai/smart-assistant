/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await setupSwagger(app, globalPrefix);
  await listen(app, globalPrefix);
}

async function listen(app: INestApplication<unknown>, globalPrefix: string) {
  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

async function setupSwagger(app: INestApplication<unknown>, globalPrefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Smart Assistant API')
    .setDescription('API for the Smart Assistant project')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, documentFactory);
}

bootstrap();

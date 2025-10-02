/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  nestApp.setGlobalPrefix(globalPrefix);
  nestApp.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  await setupSwagger(nestApp, globalPrefix);

  const port = process.env.PORT || 3000;
  await nestApp.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

async function setupSwagger(app, globalPrefix: string) {
  const config = new DocumentBuilder()
    .setTitle('Smart Assistant API')
    .setDescription('API for the Smart Assistant project')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(globalPrefix, app, documentFactory);
}

bootstrap();

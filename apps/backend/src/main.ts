/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import type { Request, Response } from 'express';

let app: INestApplication | null = null;

async function bootstrap() {
  const nestApp = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  nestApp.setGlobalPrefix(globalPrefix);
  await setupSwagger(nestApp, globalPrefix);

  const port = process.env.PORT || 3000;
  await nestApp.listen(port);
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

// Vercel serverless handler
async function handler(req: Request, res: Response) {
  if (!app) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    app = await NestFactory.create(AppModule, adapter);
    app.setGlobalPrefix('api');
    app.enableCors();
    await app.init();
  }

  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}

// Only run bootstrap in non-serverless environment
if (require.main === module) {
  bootstrap();
}

// Export for Vercel
export default handler;

/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { INestApplication, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import express, { Express } from 'express';

let cachedServer: Express;

async function createApp(): Promise<INestApplication> {
  const expressApp = express();
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp)
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  await setupSwagger(app, globalPrefix);
  await app.init();
  return app;
}

async function bootstrap() {
  const app = await createApp();
  await listen(app, 'api');
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

// Vercel serverless handler
export default async (req: any, res: any) => {
  if (!cachedServer) {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    const app = await NestFactory.create(AppModule, adapter);
    app.setGlobalPrefix('api');
    app.enableCors();
    await app.init();
    cachedServer = expressApp;
  }
  return cachedServer(req, res);
};

// Only run bootstrap in non-serverless environment
if (require.main === module) {
  bootstrap();
}

import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.set('trust proxy', 1);
  app.disable('x-powered-by');
  app.use(cookieParser());

  app.enableShutdownHooks();
  await app.listen(app.get(ConfigService).get<number>('PORT') ?? 4000);
}
await bootstrap();

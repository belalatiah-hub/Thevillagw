import 'reflect-metadata';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { text } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';

// Prisma returns BigInt for money columns; make it JSON-serialisable globally
// (as a string, to preserve precision beyond Number.MAX_SAFE_INTEGER).
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  const prefix = config.get<string>('apiPrefix') ?? 'api';
  app.setGlobalPrefix(prefix);

  app.use(helmet());

  // The marketing site posts leads as text/plain (Google-Apps-Script style,
  // sent with `mode: no-cors`). Parse those bodies so the site-capture endpoint
  // can accept them unchanged. application/json is handled by Nest by default.
  app.use(text({ type: 'text/plain', limit: '32kb' }));

  const corsOrigins = config.get<string[]>('corsOrigins') ?? [];
  app.enableCors({
    origin: corsOrigins.length ? corsOrigins : true,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  // Swagger / OpenAPI
  const swaggerConfig = new DocumentBuilder()
    .setTitle('The Village Investment — CRM API')
    .setDescription('Enterprise Real Estate CRM. See /docs for the interactive spec.')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = config.get<number>('port') ?? 3000;
  await app.listen(port);
  logger.log(`API listening on :${port}/${prefix} — docs at /docs`);
}

void bootstrap();

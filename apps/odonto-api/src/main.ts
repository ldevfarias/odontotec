import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import express from 'express';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { AppDataSource } from './typeorm.config';
import { buildCorsOrigins } from './cors.config';

async function runMigrations() {
  console.log('🔄 Running database migrations...');
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  await AppDataSource.destroy();
  console.log('✅ Migrations complete');
}

async function bootstrap() {
  await runMigrations();

  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Enable raw body for Stripe Webhooks
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ limit: '1mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.use(cookieParser());

  let allowedOrigins: string[] = [];
  try {
    allowedOrigins = buildCorsOrigins(
      process.env.FRONTEND_URL || 'http://localhost:3001',
      process.env.NODE_ENV || 'development',
    );
  } catch (err) {
    console.error(
      '[CORS] Invalid FRONTEND_URL configuration:',
      (err as Error).message,
    );
    process.exit(1);
  }

  // Required so ThrottlerGuard reads real client IPs from X-Forwarded-For behind Fly.io's nginx proxy
  if (process.env.NODE_ENV === 'production') {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Clinic-Id'],
    credentials: true,
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'same-origin' },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('OdontoTec API')
      .setDescription('Clínica Odontológica Multi-tenant API')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    // Auto-export spec for Frontend SDD loop
    const fs = require('fs');
    const path = require('path');
    const specPath = path.join(process.cwd(), 'openapi.json');
    fs.writeFileSync(specPath, JSON.stringify(document, null, 2));
    console.log(`[SDD] OpenAPI spec exported to: ${specPath}`);
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

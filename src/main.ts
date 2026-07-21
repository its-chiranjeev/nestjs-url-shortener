import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  /*
   * Security headers
   */
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );

  /*
   * CORS
   */
  const allowedOrigins = (
    configService.get<string>('CORS_ORIGINS') ??
    'http://localhost:3001'
  )
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    methods: [
      'GET',
      'POST',
      'PATCH',
      'DELETE',
    ],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
    ],
    credentials: true,
  });

  /*
   * Request validation
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  /*
   * Swagger documentation
   */
  const swaggerConfiguration =
    new DocumentBuilder()
      .setTitle('NestJS URL Shortener API')
      .setDescription(
        'A REST API for creating, managing and tracking shortened URLs.',
      )
      .setVersion('1.0.0')
      .addTag(
        'URLs',
        'Create and manage shortened URLs',
      )
      .addTag(
        'Redirect',
        'Redirect shortened URLs',
      )
      .build();

  const swaggerDocument = () =>
    SwaggerModule.createDocument(
      app,
      swaggerConfiguration,
    );

  SwaggerModule.setup(
    'api/docs',
    app,
    swaggerDocument,
    {
      customSiteTitle:
        'URL Shortener API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
      },
    },
  );

  const port = Number(
    configService.get<string>('PORT') ?? 3000,
  );

  await app.listen(port);

  console.log(
    `Server running on http://localhost:${port}`,
  );

  console.log(
    `Swagger available at http://localhost:${port}/api/docs`,
  );
}

bootstrap();
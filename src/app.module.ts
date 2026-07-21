import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UrlsModule } from './urls/urls.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,

      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),

        PORT: Joi.number().port().default(3000),

        BASE_URL: Joi.string()
          .uri({
            scheme: ['http', 'https'],
          })
          .required(),

        CORS_ORIGINS: Joi.string().required(),

        DATABASE_URL: Joi.string()
          .uri({
            scheme: ['postgres', 'postgresql'],
          })
          .required(),

        DIRECT_DATABASE_URL: Joi.string()
          .uri({
            scheme: ['postgres', 'postgresql'],
          })
          .required(),
      }),

      validationOptions: {
        abortEarly: false,
      },
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'postgres',

        url: configService.getOrThrow<string>('DATABASE_URL'),

        ssl: true,

        autoLoadEntities: true,

        synchronize: false,

        migrationsRun: false,
      }),
    }),
  ],
})
export class AppModule {}

import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class UpdateShortUrlDto {
  @ApiPropertyOptional({
    description:
      'New destination for the short URL',
    example:
      'https://github.com/its-chiranjeev',
  })
  @IsOptional()
  @IsUrl({
    require_protocol: true,
    protocols: ['http', 'https'],
  })
  originalUrl?: string;

  @ApiPropertyOptional({
    description:
      'New expiration date in ISO 8601 format',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({
    description:
      'Whether the short URL is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
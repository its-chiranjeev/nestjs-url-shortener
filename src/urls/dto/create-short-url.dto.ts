import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
} from 'class-validator';

export class CreateShortUrlDto {
  @ApiProperty({
    description: 'The original URL to shorten',
    example:
      'https://docs.nestjs.com/controllers',
  })
  @IsUrl(
    {
      require_protocol: true,
      protocols: ['http', 'https'],
    },
    {
      message:
        'originalUrl must be a valid HTTP or HTTPS URL',
    },
  )
  originalUrl!: string;

  @ApiPropertyOptional({
    description:
      'Optional custom alias containing 4–20 characters',
    example: 'nestjs-docs',
    minLength: 4,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{4,20}$/, {
    message:
      'customAlias must contain 4–20 letters, numbers, hyphens or underscores',
  })
  customAlias?: string;

  @ApiPropertyOptional({
    description:
      'Optional expiration date in ISO 8601 format',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString(
    {},
    {
      message:
        'expiresAt must be a valid ISO date',
    },
  )
  expiresAt?: string;
}
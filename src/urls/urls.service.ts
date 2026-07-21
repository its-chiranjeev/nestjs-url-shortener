import { BadRequestException, ConflictException, GoneException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { randomBytes } from 'crypto';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { UrlPaginationDto } from './dto/url-pagination.dto';
import { ShortUrl } from './entities/short-url.entity';

@Injectable()
export class UrlsService {
  constructor(
    @InjectRepository(ShortUrl)
    private readonly urlRepository: Repository<ShortUrl>,
    private readonly configService: ConfigService,
  ) {}

  async createShortUrl(dto: CreateShortUrlDto) {
    this.validateExpiration(dto.expiresAt);

    const shortCode = dto.customAlias
      ? dto.customAlias.toLowerCase()
      : await this.generateUniqueCode();

    if (dto.customAlias) {
      const existingAlias =
        await this.urlRepository.findOne({
          where: { shortCode },
          withDeleted: true,
        });

      if (existingAlias) {
        throw new ConflictException(
          'This custom alias is already in use',
        );
      }
    }

    const shortUrl = this.urlRepository.create({
      originalUrl: dto.originalUrl,
      shortCode,
      expiresAt: dto.expiresAt
        ? new Date(dto.expiresAt)
        : null,
    });

    try {
      const savedUrl =
        await this.urlRepository.save(shortUrl);

      return this.formatUrlResponse(savedUrl);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as QueryFailedError & {
          driverError?: { code?: string };
        }).driverError?.code === '23505'
      ) {
        throw new ConflictException(
          'Short code already exists',
        );
      }

      throw error;
    }
  }

  async findAll(pagination: UrlPaginationDto) {
    const { page, limit } = pagination;

    const [urls, total] =
      await this.urlRepository.findAndCount({
        order: {
          createdAt: 'DESC',
        },
        skip: (page - 1) * limit,
        take: limit,
      });

    return {
      data: urls.map((url) =>
        this.formatUrlResponse(url),
      ),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUrlDetails(shortCode: string) {
    const shortUrl =
      await this.urlRepository.findOne({
        where: { shortCode },
      });

    if (!shortUrl) {
      throw new NotFoundException(
        'Short URL not found',
      );
    }

    return this.formatUrlResponse(shortUrl);
  }

  async findForRedirect(
    shortCode: string,
  ): Promise<ShortUrl> {
    const shortUrl =
      await this.urlRepository.findOne({
        where: { shortCode },
      });

    if (!shortUrl) {
      throw new NotFoundException(
        'Short URL not found',
      );
    }

    if (!shortUrl.isActive) {
      throw new GoneException(
        'Short URL is disabled',
      );
    }

    if (
      shortUrl.expiresAt &&
      shortUrl.expiresAt.getTime() <= Date.now()
    ) {
      throw new GoneException(
        'Short URL has expired',
      );
    }

    return shortUrl;
  }

  async registerClick(id: number): Promise<void> {
    await this.urlRepository.increment(
      { id },
      'clickCount',
      1,
    );

    await this.urlRepository.update(id, {
      lastAccessedAt: new Date(),
    });
  }

  async updateShortUrl(
    shortCode: string,
    dto: UpdateShortUrlDto,
  ) {
    const shortUrl =
      await this.urlRepository.findOne({
        where: { shortCode },
      });

    if (!shortUrl) {
      throw new NotFoundException(
        'Short URL not found',
      );
    }

    this.validateExpiration(dto.expiresAt);

    if (dto.originalUrl !== undefined) {
      shortUrl.originalUrl = dto.originalUrl;
    }

    if (dto.expiresAt !== undefined) {
      shortUrl.expiresAt =
        new Date(dto.expiresAt);
    }

    if (dto.isActive !== undefined) {
      shortUrl.isActive = dto.isActive;
    }

    const updatedUrl =
      await this.urlRepository.save(shortUrl);

    return this.formatUrlResponse(updatedUrl);
  }

  async deleteShortUrl(shortCode: string) {
    const shortUrl =
      await this.urlRepository.findOne({
        where: { shortCode },
      });

    if (!shortUrl) {
      throw new NotFoundException(
        'Short URL not found',
      );
    }

    await this.urlRepository.softRemove(shortUrl);

    return {
      shortCode,
      deletedAt: new Date(),
    };
  }

  private validateExpiration(
    expiresAt?: string,
  ): void {
    if (!expiresAt) {
      return;
    }

    const expirationDate = new Date(expiresAt);

    if (
      Number.isNaN(expirationDate.getTime()) ||
      expirationDate.getTime() <= Date.now()
    ) {
      throw new BadRequestException(
        'Expiration date must be in the future',
      );
    }
  }

  private async generateUniqueCode(): Promise<string> {
    const maximumAttempts = 5;

    for (
      let attempt = 0;
      attempt < maximumAttempts;
      attempt++
    ) {
      const shortCode = randomBytes(6)
        .toString('base64url')
        .slice(0, 8);

      const existingCode =
        await this.urlRepository.findOne({
          where: { shortCode },
          withDeleted: true,
          select: {
            id: true,
          },
        });

      if (!existingCode) {
        return shortCode;
      }
    }

    throw new ConflictException(
      'Unable to generate a unique short code',
    );
  }

  private formatUrlResponse(shortUrl: ShortUrl) {
    const baseUrl =
      this.configService.get<string>('BASE_URL') ??
      'http://localhost:3000';

    return {
      id: shortUrl.id,
      originalUrl: shortUrl.originalUrl,
      shortCode: shortUrl.shortCode,
      shortUrl: `${baseUrl}/${shortUrl.shortCode}`,
      clickCount: shortUrl.clickCount,
      isActive: shortUrl.isActive,
      expiresAt: shortUrl.expiresAt,
      lastAccessedAt: shortUrl.lastAccessedAt,
      createdAt: shortUrl.createdAt,
      updatedAt: shortUrl.updatedAt,
    };
  }
}
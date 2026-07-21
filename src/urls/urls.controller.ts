import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiGoneResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { UpdateShortUrlDto } from './dto/update-short-url.dto';
import { UrlPaginationDto } from './dto/url-pagination.dto';
import { UrlsService } from './urls.service';

@ApiTags('URLs')
@Controller()
export class UrlsController {
  constructor(
    private readonly urlsService: UrlsService,
  ) {}

  /*
   * Create a shortened URL
   */
  @Post('api/urls')
  @HttpCode(HttpStatus.CREATED)
  @Throttle({
    default: {
      limit: 10,
      ttl: 60_000,
    },
  })
  @ApiOperation({
    summary: 'Create a shortened URL',
  })
  @ApiBody({
    type: CreateShortUrlDto,
  })
  @ApiCreatedResponse({
    description:
      'Short URL created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description:
      'Custom alias or short code already exists',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many requests',
  })
  async createShortUrl(
    @Body() dto: CreateShortUrlDto,
  ) {
    const data =
      await this.urlsService.createShortUrl(dto);

    return {
      success: true,
      message: 'Short URL created successfully',
      data,
    };
  }

  /*
   * Get paginated shortened URLs
   */
  @Get('api/urls')
  @ApiOperation({
    summary: 'Get paginated shortened URLs',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Short URLs retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Invalid pagination parameters',
  })
  async findAll(
    @Query() pagination: UrlPaginationDto,
  ) {
    const result =
      await this.urlsService.findAll(pagination);

    return {
      success: true,
      message:
        'Short URLs retrieved successfully',
      ...result,
    };
  }

  /*
   * Get the details of one shortened URL
   */
  @Get('api/urls/:shortCode')
  @ApiOperation({
    summary: 'Get short URL details',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short URL code',
    example: 'qBxuCiZL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Short URL retrieved successfully',
  })
  @ApiNotFoundResponse({
    description: 'Short URL not found',
  })
  async getUrlDetails(
    @Param('shortCode') shortCode: string,
  ) {
    const data =
      await this.urlsService.getUrlDetails(
        shortCode,
      );

    return {
      success: true,
      message:
        'Short URL retrieved successfully',
      data,
    };
  }

  /*
   * Update a shortened URL
   */
  @Patch('api/urls/:shortCode')
  @ApiOperation({
    summary: 'Update a shortened URL',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short URL code',
    example: 'qBxuCiZL',
  })
  @ApiBody({
    type: UpdateShortUrlDto,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Short URL updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data',
  })
  @ApiNotFoundResponse({
    description: 'Short URL not found',
  })
  async updateShortUrl(
    @Param('shortCode') shortCode: string,
    @Body() dto: UpdateShortUrlDto,
  ) {
    const data =
      await this.urlsService.updateShortUrl(
        shortCode,
        dto,
      );

    return {
      success: true,
      message: 'Short URL updated successfully',
      data,
    };
  }

  /*
   * Soft-delete a shortened URL
   */
  @Delete('api/urls/:shortCode')
  @ApiOperation({
    summary: 'Soft-delete a shortened URL',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short URL code',
    example: 'qBxuCiZL',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description:
      'Short URL deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'Short URL not found',
  })
  async deleteShortUrl(
    @Param('shortCode') shortCode: string,
  ) {
    const data =
      await this.urlsService.deleteShortUrl(
        shortCode,
      );

    return {
      success: true,
      message: 'Short URL deleted successfully',
      data,
    };
  }

  /*
   * Redirect to the original URL
   */
  @Get(':shortCode')
  @Throttle({
    default: {
      limit: 60,
      ttl: 60_000,
    },
  })
  @ApiTags('Redirect')
  @ApiOperation({
    summary: 'Redirect to the original URL',
  })
  @ApiParam({
    name: 'shortCode',
    description: 'Unique short URL code',
    example: 'qBxuCiZL',
  })
  @ApiResponse({
    status: HttpStatus.FOUND,
    description:
      'Redirect to the original URL',
  })
  @ApiNotFoundResponse({
    description: 'Short URL not found',
  })
  @ApiGoneResponse({
    description:
      'Short URL is expired or disabled',
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Too many redirect requests',
  })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Res() response: Response,
  ) {
    const shortUrl =
      await this.urlsService.findForRedirect(
        shortCode,
      );

    await this.urlsService.registerClick(
      shortUrl.id,
    );

    return response.redirect(
      HttpStatus.FOUND,
      shortUrl.originalUrl,
    );
  }
}
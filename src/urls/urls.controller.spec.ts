import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { UrlsController } from './urls.controller';
import { UrlsService } from './urls.service';

describe('UrlsController', () => {
  let controller: UrlsController;

  const urlsServiceMock = {
    createShortUrl: jest.fn(),
    findAll: jest.fn(),
    getUrlDetails: jest.fn(),
    updateShortUrl: jest.fn(),
    deleteShortUrl: jest.fn(),
    findForRedirect: jest.fn(),
    registerClick: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        controllers: [UrlsController],

        providers: [
          {
            provide: UrlsService,
            useValue: urlsServiceMock,
          },
        ],
      }).compile();

    controller =
      module.get<UrlsController>(
        UrlsController,
      );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a short URL', async () => {
    const serviceResult = {
      id: 1,
      originalUrl: 'https://nestjs.com',
      shortCode: 'nestjs',
      shortUrl:
        'http://localhost:3000/nestjs',
      clickCount: 0,
      isActive: true,
      expiresAt: null,
      lastAccessedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    urlsServiceMock.createShortUrl
      .mockResolvedValue(serviceResult);

    const result =
      await controller.createShortUrl({
        originalUrl: 'https://nestjs.com',
        customAlias: 'nestjs',
      });

    expect(result).toEqual({
      success: true,
      message:
        'Short URL created successfully',
      data: serviceResult,
    });

    expect(
      urlsServiceMock.createShortUrl,
    ).toHaveBeenCalledWith({
      originalUrl: 'https://nestjs.com',
      customAlias: 'nestjs',
    });
  });

  it('should return paginated URLs', async () => {
    const serviceResult = {
      data: [],
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      },
    };

    urlsServiceMock.findAll.mockResolvedValue(
      serviceResult,
    );

    const result = await controller.findAll({
      page: 1,
      limit: 10,
    });

    expect(result).toEqual({
      success: true,
      message:
        'Short URLs retrieved successfully',
      ...serviceResult,
    });
  });
});
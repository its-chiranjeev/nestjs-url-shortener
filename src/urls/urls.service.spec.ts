import { ConfigService } from '@nestjs/config';
import {
  Test,
  TestingModule,
} from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ShortUrl } from './entities/short-url.entity';
import { UrlsService } from './urls.service';

describe('UrlsService', () => {
  let service: UrlsService;

  const repositoryMock = {
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    increment: jest.fn(),
    update: jest.fn(),
    softRemove: jest.fn(),
  };

  const configServiceMock = {
    get: jest
      .fn()
      .mockReturnValue(
        'http://localhost:3000',
      ),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule =
      await Test.createTestingModule({
        providers: [
          UrlsService,

          {
            provide:
              getRepositoryToken(ShortUrl),
            useValue: repositoryMock,
          },

          {
            provide: ConfigService,
            useValue: configServiceMock,
          },
        ],
      }).compile();

    service = module.get<UrlsService>(
      UrlsService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should reject an expired URL', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 1,
      originalUrl: 'https://nestjs.com',
      shortCode: 'nestjs',
      clickCount: 0,
      isActive: true,
      expiresAt: new Date(
        Date.now() - 1_000,
      ),
      lastAccessedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    await expect(
      service.findForRedirect('nestjs'),
    ).rejects.toThrow(
      'Short URL has expired',
    );
  });

  it('should increment the click count', async () => {
    repositoryMock.increment.mockResolvedValue({
      affected: 1,
    });

    repositoryMock.update.mockResolvedValue({
      affected: 1,
    });

    await service.registerClick(1);

    expect(
      repositoryMock.increment,
    ).toHaveBeenCalledWith(
      { id: 1 },
      'clickCount',
      1,
    );

    expect(
      repositoryMock.update,
    ).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        lastAccessedAt: expect.any(Date),
      }),
    );
  });
});
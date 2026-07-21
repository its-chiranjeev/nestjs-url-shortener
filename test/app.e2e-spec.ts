import {
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { UrlsController } from '../src/urls/urls.controller';
import { UrlsService } from '../src/urls/urls.service';

describe('UrlsController (e2e)', () => {
  let app: INestApplication;

  const shortUrlData = {
    id: 1,
    originalUrl: 'https://nestjs.com',
    shortCode: 'nestjs',
    shortUrl:
      'http://localhost:3000/nestjs',
    clickCount: 0,
    isActive: true,
    expiresAt: null,
    lastAccessedAt: null,
    createdAt:
      '2026-07-21T10:00:00.000Z',
    updatedAt:
      '2026-07-21T10:00:00.000Z',
  };

  const urlsServiceMock = {
    createShortUrl: jest.fn(),
    findAll: jest.fn(),
    getUrlDetails: jest.fn(),
    updateShortUrl: jest.fn(),
    deleteShortUrl: jest.fn(),
    findForRedirect: jest.fn(),
    registerClick: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef =
      await Test.createTestingModule({
        controllers: [UrlsController],
        providers: [
          {
            provide: UrlsService,
            useValue: urlsServiceMock,
          },
        ],
      }).compile();

    app = moduleRef.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    urlsServiceMock.createShortUrl
      .mockResolvedValue(shortUrlData);

    urlsServiceMock.findAll.mockResolvedValue({
      data: [shortUrlData],
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      },
    });

    urlsServiceMock.getUrlDetails
      .mockResolvedValue(shortUrlData);

    urlsServiceMock.updateShortUrl
      .mockResolvedValue({
        ...shortUrlData,
        isActive: false,
      });

    urlsServiceMock.deleteShortUrl
      .mockResolvedValue({
        shortCode: 'nestjs',
        deletedAt:
          '2026-07-21T11:00:00.000Z',
      });

    urlsServiceMock.findForRedirect
      .mockResolvedValue(shortUrlData);

    urlsServiceMock.registerClick
      .mockResolvedValue(undefined);
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/urls creates a URL', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .post('/api/urls')
      .send({
        originalUrl: 'https://nestjs.com',
        customAlias: 'nestjs',
      })
      .expect(201);

    expect(response.body).toMatchObject({
      success: true,
      message:
        'Short URL created successfully',
      data: {
        shortCode: 'nestjs',
      },
    });

    expect(
      urlsServiceMock.createShortUrl,
    ).toHaveBeenCalledWith({
      originalUrl: 'https://nestjs.com',
      customAlias: 'nestjs',
    });
  });

  it('POST /api/urls rejects an invalid URL', async () => {
    await request(app.getHttpServer())
      .post('/api/urls')
      .send({
        originalUrl: 'invalid-url',
      })
      .expect(400);

    expect(
      urlsServiceMock.createShortUrl,
    ).not.toHaveBeenCalled();
  });

  it('GET /api/urls returns paginated URLs', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/api/urls?page=1&limit=10')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      pagination: {
        page: 1,
        limit: 10,
        total: 1,
      },
    });
  });

  it('GET /api/urls/:shortCode returns details', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .get('/api/urls/nestjs')
      .expect(200);

    expect(response.body.data).toMatchObject({
      shortCode: 'nestjs',
      originalUrl: 'https://nestjs.com',
    });
  });

  it('PATCH /api/urls/:shortCode updates a URL', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .patch('/api/urls/nestjs')
      .send({
        isActive: false,
      })
      .expect(200);

    expect(response.body.data.isActive).toBe(
      false,
    );

    expect(
      urlsServiceMock.updateShortUrl,
    ).toHaveBeenCalledWith('nestjs', {
      isActive: false,
    });
  });

  it('GET /:shortCode redirects', async () => {
    await request(app.getHttpServer())
      .get('/nestjs')
      .expect(302)
      .expect('Location', 'https://nestjs.com');

    expect(
      urlsServiceMock.registerClick,
    ).toHaveBeenCalledWith(1);
  });

  it('DELETE /api/urls/:shortCode deletes a URL', async () => {
    const response = await request(
      app.getHttpServer(),
    )
      .delete('/api/urls/nestjs')
      .expect(200);

    expect(response.body).toMatchObject({
      success: true,
      message:
        'Short URL deleted successfully',
    });
  });
});
# NestJS URL Shortener API

A production-oriented REST API for creating, managing, and tracking shortened URLs. Built with NestJS, TypeScript, PostgreSQL, TypeORM, and Neon.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat-square&logo=nestjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![TypeORM](https://img.shields.io/badge/TypeORM-FE0803?style=flat-square&logo=typeorm&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)

## Features

- Generate collision-resistant short codes
- Create human-readable custom aliases
- Redirect short URLs using HTTP `302 Found`
- Configure optional URL expiration dates
- Enable, disable, update, and soft-delete shortened URLs
- Track click counts and last-accessed timestamps
- Retrieve URLs using pagination
- Validate request bodies and environment variables
- Protect endpoints with rate limiting, CORS, and Helmet security headers
- Manage the database schema through TypeORM migrations
- Explore and test endpoints through Swagger UI
- Run unit and HTTP endpoint tests with Jest and Supertest

## Technology Stack

- **Runtime:** Node.js
- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL on Neon
- **ORM:** TypeORM
- **Validation:** class-validator, class-transformer, and Joi
- **Security:** Helmet and `@nestjs/throttler`
- **Documentation:** Swagger/OpenAPI
- **Testing:** Jest and Supertest

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/urls` | Create a shortened URL |
| `GET` | `/api/urls` | List shortened URLs with pagination |
| `GET` | `/api/urls/:shortCode` | Get details for one shortened URL |
| `PATCH` | `/api/urls/:shortCode` | Update a URL, expiration date, or status |
| `DELETE` | `/api/urls/:shortCode` | Soft-delete a shortened URL |
| `GET` | `/:shortCode` | Redirect to the original URL |

## Getting Started

### Prerequisites

- Node.js 20 or later
- npm
- A PostgreSQL database or free Neon project

### Installation

```bash
git clone https://github.com/its-chiranjeev/nestjs-url-shortener.git
cd nestjs-url-shortener
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and provide your own values:

```env
NODE_ENV=development
PORT=3000

BASE_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3001

# Pooled connection used by the application
DATABASE_URL=

# Direct connection used by TypeORM migrations
DIRECT_DATABASE_URL=
```

### Database Migrations

Check pending migrations:

```bash
npm run migration:show
```

Run migrations:

```bash
npm run migration:run
```

Revert the most recent migration:

```bash
npm run migration:revert
```

### Run the Application

Development mode:

```bash
npm run start:dev
```

Production build:

```bash
npm run build
npm run start:prod
```

The API runs at `http://localhost:3000` by default.

## API Documentation

Start the application and open:

```text
http://localhost:3000/api/docs
```

The Swagger interface documents request bodies, parameters, response codes, and validation requirements.

## Usage Examples

### Create a Short URL

```http
POST /api/urls
Content-Type: application/json
```

```json
{
  "originalUrl": "https://docs.nestjs.com/controllers",
  "customAlias": "nestjs-docs",
  "expiresAt": "2026-12-31T23:59:59.000Z"
}
```

Example response:

```json
{
  "success": true,
  "message": "Short URL created successfully",
  "data": {
    "id": 1,
    "originalUrl": "https://docs.nestjs.com/controllers",
    "shortCode": "nestjs-docs",
    "shortUrl": "http://localhost:3000/nestjs-docs",
    "clickCount": 0,
    "isActive": true,
    "expiresAt": "2026-12-31T23:59:59.000Z"
  }
}
```

Open the returned `shortUrl` in a browser to receive a `302` redirect to the original URL.

## Testing

Run unit tests:

```bash
npm run test
```

Run HTTP endpoint tests:

```bash
npm run test:e2e
```

Generate a coverage report:

```bash
npm run test:cov
```

## Project Structure

```text
src/
├── database/
│   ├── migrations/
│   └── data-source.ts
├── urls/
│   ├── dto/
│   ├── entities/
│   ├── urls.controller.ts
│   ├── urls.service.ts
│   └── urls.module.ts
├── app.module.ts
└── main.ts
test/
└── app.e2e-spec.ts
```

## Security Notes

- Only HTTP and HTTPS destination URLs are accepted.
- URL creation and redirect endpoints are rate-limited.
- Environment variables are validated during application startup.
- Security-related HTTP headers are configured using Helmet.
- Database credentials remain outside source control.

## Future Improvements

- User registration and JWT authentication
- Per-user URL management
- Detailed visit analytics
- QR-code generation
- Custom domains
- Automated CI/CD workflow

## Author

**Chiranjeev Rastogi**

- GitHub: [@its-chiranjeev](https://github.com/its-chiranjeev)
- Email: [chiranjeevrastogi@gmail.com](mailto:chiranjeevrastogi@gmail.com)

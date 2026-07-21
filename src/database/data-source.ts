import 'dotenv/config';
import { join } from 'node:path';
import { DataSource } from 'typeorm';

const directDatabaseUrl =
  process.env.DIRECT_DATABASE_URL;

if (!directDatabaseUrl) {
  throw new Error(
    'DIRECT_DATABASE_URL is required for migrations',
  );
}

const dataSource = new DataSource({
  type: 'postgres',

  url: directDatabaseUrl,

  ssl: true,

  synchronize: false,

  migrationsTableName: 'migrations',

  entities: [
    join(
      __dirname,
      '..',
      '**',
      '*.entity.{ts,js}',
    ),
  ],

  migrations: [
    join(
      __dirname,
      'migrations',
      '*.{ts,js}',
    ),
  ],
});

export default dataSource;
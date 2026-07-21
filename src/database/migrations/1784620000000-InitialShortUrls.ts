import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class InitialShortUrls1784620000000
  implements MigrationInterface
{
  name = 'InitialShortUrls1784620000000';

  async up(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'short_urls',

        columns: [
          {
            name: 'id',
            type: 'integer',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          {
            name: 'originalUrl',
            type: 'text',
            isNullable: false,
          },
          {
            name: 'shortCode',
            type: 'varchar',
            length: '20',
            isNullable: false,
          },
          {
            name: 'clickCount',
            type: 'integer',
            default: 0,
            isNullable: false,
          },
          {
            name: 'isActive',
            type: 'boolean',
            default: true,
            isNullable: false,
          },
          {
            name: 'expiresAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'lastAccessedAt',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamptz',
            default: 'now()',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamptz',
            isNullable: true,
          },
        ],
      }),
      true,
    );

    await queryRunner.createIndex(
      'short_urls',
      new TableIndex({
        name: 'IDX_short_urls_shortCode',
        columnNames: ['shortCode'],
        isUnique: true,
      }),
    );
  }

  async down(
    queryRunner: QueryRunner,
  ): Promise<void> {
    await queryRunner.dropTable(
      'short_urls',
      true,
    );
  }
}
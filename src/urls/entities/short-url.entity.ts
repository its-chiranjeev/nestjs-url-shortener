import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('short_urls')
export class ShortUrl {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  originalUrl!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 20 })
  shortCode!: string;

  @Column({ type: 'int', default: 0 })
  clickCount!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt?: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  lastAccessedAt?: Date | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;
}
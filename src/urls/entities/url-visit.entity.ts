import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, } from 'typeorm';

@Entity('url_visits')
export class UrlVisit {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  shortUrlId!: number;

  @Column({ nullable: true })
  referrer?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @CreateDateColumn()
  visitedAt!: Date;
}
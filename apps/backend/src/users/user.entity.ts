import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  name: string;

  @Column()
  provider: string;

  @Column()
  providerId: string;

  @Column({ nullable: true })
  refreshToken: string;
}
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'matches' })
export class MatchEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  winner!: string;

  @Column()
  loser!: string;

  @Column({ default: false })
  draw!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'players' })
export class PlayerEntity {
  @PrimaryColumn()
  id!: string;

  @Column('integer')
  rank!: number;
}

export type Player = PlayerEntity;

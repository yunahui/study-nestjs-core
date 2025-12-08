import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class MovieDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;
}

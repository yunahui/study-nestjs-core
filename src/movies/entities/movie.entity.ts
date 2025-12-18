import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommonEntity } from '../../common/entity/common.entity';
import { MovieDetail } from './movie-detail.entity';
import { Director } from '../../directors/entities/director.entity';
import { Genre } from '../../genres/entities/genre.entity';

@Entity()
export class Movie extends CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @ManyToMany(() => Genre, (genre) => genre.movies)
  @JoinTable()
  genres: Genre[];

  @Column({
    default: 0,
  })
  likeCount: number;

  @OneToOne(() => MovieDetail, {
    cascade: true,
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  detail: MovieDetail;

  @ManyToOne(() => Director, {
    nullable: false,
  })
  @JoinColumn()
  director: Director;
}

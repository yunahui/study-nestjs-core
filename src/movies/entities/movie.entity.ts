import {
  Column,
  Entity, JoinColumn, OneToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import {CommonEntity} from "../../common/entity/common.entity";
import {MovieDetail} from "./movie-detail.entity";

@Entity()
export class Movie extends CommonEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @OneToOne(() => MovieDetail, {
    cascade: true,
    onDelete: "CASCADE",
  })
  @JoinColumn()
  detail: MovieDetail
}

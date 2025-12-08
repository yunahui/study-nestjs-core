import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from "typeorm";
import {CommonEntity} from "../../common/entity/common.entity";

@Entity()
export class Movie extends CommonEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;
}

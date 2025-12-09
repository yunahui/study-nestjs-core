import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export enum Role {
  admin,
  paidUser,
  user,
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    unique: true,
  })
  email: string;

  @Exclude({
    toPlainOnly: true,
  })
  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.user,
  })
  role: Role;
}

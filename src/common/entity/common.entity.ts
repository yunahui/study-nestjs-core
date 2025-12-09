import { CreateDateColumn, UpdateDateColumn, VersionColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

export class CommonEntity {
  @Exclude()
  @CreateDateColumn()
  createdAt: Date;
  @Exclude()
  @UpdateDateColumn()
  updatedAt: Date;
  @Exclude()
  @VersionColumn()
  version: number;
}

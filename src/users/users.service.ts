import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.users.create(createUserDto);
  }

  findAll() {
    return this.users.find();
  }

  async findOne(id: number) {
    const user = await this.users.findOne({ where: { id } });

    if (!user) throw new NotFoundException();

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.users.findOne({ where: { id } });

    await this.users.update({ id }, updateUserDto);

    return this.users.findOne({ where: { id } });
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    return this.users.delete({ id });
  }
}

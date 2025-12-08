import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entities/director.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DirectorsService {
  constructor(
    @InjectRepository(Director) private directors: Repository<Director>,
  ) {}

  create(createDirectorDto: CreateDirectorDto) {
    return this.directors.save({ ...createDirectorDto });
  }

  findAll() {
    return this.directors.find();
  }

  findOne(id: number) {
    const director = this.directors.find({ where: { id } });

    if (!director) {
      throw new NotFoundException(`Director ${id} not found`);
    }

    return director;
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    await this.directors.update({ id }, { ...updateDirectorDto });

    return this.findOne(id);
  }

  remove(id: number) {
    return this.directors.delete(id);
  }
}

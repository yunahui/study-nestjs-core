import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGenreDto } from './dto/create-genre.dto';
import { UpdateGenreDto } from './dto/update-genre.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Genre } from './entities/genre.entity';
import { Repository } from 'typeorm';

@Injectable()
export class GenresService {
  constructor(@InjectRepository(Genre) private genres: Repository<Genre>) {}

  create(createGenreDto: CreateGenreDto) {
    return this.genres.save(createGenreDto);
  }

  findAll() {
    return this.genres.find();
  }

  findOne(id: number) {
    const genre = this.genres.findOne({ where: { id } });

    if (!genre) {
      throw new NotFoundException(`Genre with id ${id} not found`);
    }

    return genre;
  }

  async update(id: number, updateGenreDto: UpdateGenreDto) {
    await this.findOne(id);

    await this.genres.update({ id }, updateGenreDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);

    return this.genres.delete(id);
  }
}

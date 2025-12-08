import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {Movie} from "./entities/movie.entity";

@Injectable()
export class MoviesService {

  idCounter = 1;
  data: Movie[] = [];

  onModuleInit() {
    this.data.push({
      id: 1,
      title: '해리포터',
      genre: 'fantasy'
    })
  }

  create(createMovieDto: CreateMovieDto) {

  }

  findAll() {
    return this.data;
  }

  findOne(id: number) {

    const item = this.data.find(item => item.id === id);

    if (!item) throw new NotFoundException();

    return item;
  }

  update(id: number, updateMovieDto: UpdateMovieDto) {
    return updateMovieDto;
  }

  remove(id: number) {
    return `This action removes a #${id} movie`;
  }
}

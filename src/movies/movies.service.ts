import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {Movie} from "./entities/movie.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, Repository} from "typeorm";
import {GetMoviesDto} from "./dto/get-movies.dto";

@Injectable()
export class MoviesService {

  constructor(
    @InjectRepository(Movie) private readonly movies: Repository<Movie>
  ) {}

  create(createMovieDto: CreateMovieDto) {
    return this.movies.save(createMovieDto);
  }

  findAll(query?: GetMoviesDto) {

    const qb = this.movies.createQueryBuilder('movies');

    if (query?.title) {
      qb.where({ title: Like(`%${query.title}%`)})
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const movie = await this.movies.findOne({ where: {id}});

    if (!movie) throw new NotFoundException();

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    await this.findOne(id);

    await this.movies.update({id}, updateMovieDto);

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.movies.delete(id)

    return id;
  }
}

import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import {Movie} from "./entities/movie.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Like, Repository} from "typeorm";
import {GetMoviesDto} from "./dto/get-movies.dto";
import {MovieDetail} from "./entities/movie-detail.entity";

@Injectable()
export class MoviesService {

  constructor(
    @InjectRepository(Movie) private readonly movies: Repository<Movie>,
    @InjectRepository(MovieDetail) private readonly movieDetails: Repository<MovieDetail>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {

    return this.movies.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre,
      detail: {
        description: createMovieDto.description,
      }
    });
  }

  findAll(query?: GetMoviesDto) {

    const qb = this.movies.createQueryBuilder('movies');

    if (query?.title) {
      qb.where({ title: Like(`%${query.title}%`)})
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const movie = await this.movies.findOne({ where: {id}, relations: ['detail'] });

    if (!movie) throw new NotFoundException();

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findOne(id);

    const { description, ...movieRest } = updateMovieDto;

    await this.movies.update({id}, movieRest);

    if (description) {
      await this.movieDetails.update({ id: movie.detail.id }, { description })
    }

    return this.findOne(id);
  }

  async remove(id: number) {
    const movie = await this.findOne(id);

    await this.movies.delete(id);
    await this.movieDetails.delete({ id: movie.id });
    return id;
  }
}

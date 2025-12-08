import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, Repository } from 'typeorm';
import { GetMoviesDto } from './dto/get-movies.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from '../directors/entities/director.entity';
import { Genre } from '../genres/entities/genre.entity';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly movies: Repository<Movie>,
    @InjectRepository(MovieDetail)
    private readonly movieDetails: Repository<MovieDetail>,
    @InjectRepository(Director)
    private readonly directors: Repository<Director>,
    @InjectRepository(Genre)
    private readonly genres: Repository<Genre>,
  ) {}

  async create(createMovieDto: CreateMovieDto) {
    const director = await this.directors.findOne({
      where: { id: createMovieDto.directorId },
    });

    const genres = await this.genres.find({
      where: { id: In(createMovieDto.genreIds) },
    });

    if (genres.length !== createMovieDto.genreIds.length) {
      throw new NotFoundException('Genre not found');
    }

    if (!director) {
      throw new NotFoundException('Director not found');
    }

    return this.movies.save({
      title: createMovieDto.title,
      genres,
      detail: {
        description: createMovieDto.description,
      },
      director,
    });
  }

  findAll(query?: GetMoviesDto) {
    const qb = this.movies.createQueryBuilder('movies');

    qb.relation('director');
    qb.relation('genre');

    if (query?.title) {
      qb.where({ title: Like(`%${query.title}%`) });
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const movie = await this.movies.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) throw new NotFoundException();

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto) {
    const movie = await this.findOne(id);

    const { description, directorId, genreIds, ...movieRest } = updateMovieDto;

    if (genreIds) {
      const newGenres = await this.genres.find({ where: { id: In(genreIds) } });

      if (newGenres.length !== genreIds.length) throw new NotFoundException();

      await this.movies.save({ id, genres: newGenres });
    }

    if (directorId) {
      const newDirector = await this.directors.findOne({
        where: { id: directorId },
      });

      if (!newDirector) throw new NotFoundException();

      movieRest['director'] = newDirector;
    }

    console.log(movieRest);

    await this.movies.update({ id }, movieRest);

    if (description) {
      await this.movieDetails.update({ id: movie.detail.id }, { description });
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

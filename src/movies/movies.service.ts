import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like, QueryRunner, Repository } from 'typeorm';
import { GetMoviesDto } from './dto/get-movies.dto';
import { MovieDetail } from './entities/movie-detail.entity';
import { Director } from '../directors/entities/director.entity';
import { Genre } from '../genres/entities/genre.entity';
import { CommonService } from '../common/common.service';
import { join } from 'path';
import { rename } from 'node:fs/promises';

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
    private readonly common: CommonService,
  ) {}

  async create(dto: CreateMovieDto, creatorId: number, qr: QueryRunner) {
    const director = await qr.manager.findOne(Director, {
      where: { id: dto.directorId },
    });

    if (!director) {
      throw new NotFoundException('존재하지 않는 감독입니다.');
    }

    const genres = await qr.manager.find(Genre, {
      where: { id: In(dto.genreIds) },
    });

    if (genres.length !== dto.genreIds.length) {
      throw new NotFoundException('존재하지 않는 장르입니다.');
    }

    const movieDir = join('public', 'movie');
    const tempDir = join('public', 'temp');

    const movie = qr.manager.create(Movie, {
      title: dto.title,
      genres,
      detail: {
        description: dto.description,
      },
      director,
      creator: {
        id: creatorId,
      },
      movieFilePath: join(movieDir, dto.movieFileName),
    });

    const createdMovie = await qr.manager.save(Movie, movie);

    await rename(
      join(process.cwd(), tempDir, dto.movieFileName),
      join(process.cwd(), movieDir, dto.movieFileName),
    );

    return createdMovie;
  }

  async findAll(dto: GetMoviesDto) {
    const { title } = dto;

    const qb = this.movies.createQueryBuilder('movie');

    qb.leftJoinAndSelect('movie.director', 'director');
    qb.leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where({ title: Like(`%${title}%`) });
    }

    // this.common.applyPagePagination(qb, dto);
    const { nextCursor } = await this.common.applyCursorPagination(qb, dto);

    const [data, count] = await qb.getManyAndCount();

    return {
      data,
      nextCursor,
      count,
    };
  }

  async findOne(id: number) {
    const movie = await this.movies.findOne({
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) throw new NotFoundException();

    return movie;
  }

  async update(id: number, updateMovieDto: UpdateMovieDto, qr: QueryRunner) {
    const movie = await qr.manager.findOne(Movie, {
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });

    if (!movie) throw new NotFoundException();

    const { description, directorId, genreIds, ...movieRest } = updateMovieDto;

    if (genreIds) {
      const newGenres = await qr.manager.find(Genre, {
        where: { id: In(genreIds) },
      });

      if (newGenres.length !== genreIds.length) throw new NotFoundException();

      await qr.manager.save(Movie, { id, genres: newGenres });
    }

    if (directorId) {
      const newDirector = await qr.manager.findOne(Director, {
        where: { id: directorId },
      });

      if (!newDirector) throw new NotFoundException();

      movieRest['director'] = newDirector;
    }

    await qr.manager.update(Movie, { id }, movieRest);

    if (description) {
      await qr.manager.update(
        MovieDetail,
        { id: movie.detail.id },
        { description },
      );
    }

    return qr.manager.findOne(Movie, {
      where: { id },
      relations: ['detail', 'director', 'genres'],
    });
  }

  async remove(id: number) {
    const movie = await this.findOne(id);

    await this.movies.delete(id);
    await this.movieDetails.delete({ id: movie.id });
    return id;
  }
}

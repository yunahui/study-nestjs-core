import { Module } from '@nestjs/common';
import { MoviesService } from './movies.service';
import { MoviesController } from './movies.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Movie} from "./entities/movie.entity";
import {MovieDetail} from "./entities/movie-detail.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Movie, MovieDetail])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}

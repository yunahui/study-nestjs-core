import { Module } from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigModule, ConfigService} from "@nestjs/config";
import Joi from "joi";
import {Movie} from "./movies/entities/movie.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        ENV: Joi.string().valid('dev', 'prod').required(),
        DB_TYPE: Joi.string().valid('mariadb').required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_NAME: Joi.string().required(),
      })
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService)=> ({
        type: cs.get<string>('DB_TYPE') as "mariadb",
        host: cs.get<string>("DB_HOST"),
        port: cs.get<number>("DB_PORT"),
        username: cs.get<string>("DB_USER"),
        password: cs.get<string>("DB_PASS"),
        database: cs.get<string>("DB_NAME"),
        entities: [Movie],
        synchronize: true,
      }),
    }),
    MoviesModule
  ],
})
export class AppModule {}

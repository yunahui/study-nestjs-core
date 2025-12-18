import {
  ClassSerializerInterceptor,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { MoviesModule } from './movies/movies.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { Movie } from './movies/entities/movie.entity';
import { MovieDetail } from './movies/entities/movie-detail.entity';
import { DirectorsModule } from './directors/directors.module';
import { Director } from './directors/entities/director.entity';
import { GenresModule } from './genres/genres.module';
import { Genre } from './genres/entities/genre.entity';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { ENV_KEY } from './common/const/env.const';
import { BearerTokenMiddleware } from './auth/middleware/bearer-token.middleware';
import { AuthGuard } from './auth/guard/auth.guard';
import { RBACGuard } from './auth/guard/rbac.guard';
import { ResponseTimeInterceoptor } from './common/interceptor/response-time.interceoptor';

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
        HASH_ROUNDS: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        type: cs.get<string>(ENV_KEY.DB_TYPE) as 'mariadb',
        host: cs.get<string>(ENV_KEY.DB_HOST),
        port: cs.get<number>(ENV_KEY.DB_PORT),
        username: cs.get<string>(ENV_KEY.DB_USER),
        password: cs.get<string>(ENV_KEY.DB_PASS),
        database: cs.get<string>(ENV_KEY.DB_NAME),
        entities: [Director, Genre, Movie, MovieDetail, User],
        synchronize: true,
      }),
    }),
    MoviesModule,
    DirectorsModule,
    GenresModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTimeInterceoptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RBACGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BearerTokenMiddleware)
      .exclude({
        path: 'auth/login',
        method: RequestMethod.POST,
      })
      .exclude({
        path: 'auth/register',
        method: RequestMethod.POST,
      })
      .forRoutes('*');
  }
}

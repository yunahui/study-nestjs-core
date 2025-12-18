import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseInterceptors,
  Request,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { RBAC } from '../auth/decorator/rbac.decorator';
import { Role } from '../users/entities/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from '../common/interceptor/transaction.interceptor';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  create(@Request() req: Request, @Body() createMovieDto: CreateMovieDto) {
    const qr = req['qr'];
    return this.moviesService.create(createMovieDto, qr);
  }

  @Get()
  findAll(@Query() dto: GetMoviesDto) {
    return this.moviesService.findAll(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(TransactionInterceptor)
  update(
    @Request() req: Request,
    @Param('id') id: string,
    @Body() updateMovieDto: UpdateMovieDto,
  ) {
    const qr = req['qr'];
    return this.moviesService.update(+id, updateMovieDto, qr);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(+id);
  }
}

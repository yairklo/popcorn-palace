import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  HttpCode,
} from '@nestjs/common';
import { MoviesService } from './movies.service';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import { ShowtimesService } from 'src/showtimes/showtimes.service';

@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly showtimesService: ShowtimesService,
  ) {}

  @Post()
  @HttpCode(200)
  create(@Body() createMovieDto: CreateMovieDto) {
    return this.moviesService.create(createMovieDto);
  }

  @Get('all')
  findAll() {
    return this.moviesService.findAll();
  }


  @Post('update/:title')
  @HttpCode(200)
  updateByTitle(@Param('title') title: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.updateByTitle(title, dto);
  }

  @Delete(':title')
  deleteByTitle(@Param('title') title: string) {
    return this.moviesService.deleteByTitle(title);
  }
}

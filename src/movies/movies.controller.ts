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
  @Get()
  findAll() {
    return this.moviesService.findAll();
  }

  @Get()
  findById() {}

  @Get(':id/showtimes')
  getShowtimesForMovie(@Param('id', ParseIntPipe) movieId: number) {
    return this.showtimesService.findByMovieId(movieId);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateMovieDto: UpdateMovieDto) {
    return this.moviesService.update(id, updateMovieDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moviesService.remove(id);
  }

  @Post('update/:title')
  updateByTitle(@Param('title') title: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.updateByTitle(title, dto);
  }

  // Legacy: Delete by movie title
  @Delete(':title')
  deleteByTitle(@Param('title') title: string) {
    return this.moviesService.deleteByTitle(title);
  }
}

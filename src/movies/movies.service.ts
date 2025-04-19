import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto, UpdateMovieDto } from './dto/movie.dto';
import {
  validateMovieDuration,
  validateReleaseYear,
} from './utils/movie-validation';

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
  ) {}

  create(movie: CreateMovieDto) {
    validateMovieDuration(movie);
    validateReleaseYear(movie);
    const newMovie = this.movieRepository.create(movie);
    return this.movieRepository.save(newMovie);
  }

  findAll() {
    return this.movieRepository.find();
  }

  async update(id: string, movie: UpdateMovieDto) {
    const exists = await this.movieRepository.findOneBy({ id: Number(id) });
    if (!exists) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }

    const updatedMovie = {
      ...exists,
      ...movie,
    };

    validateMovieDuration(updatedMovie);
    validateReleaseYear(updatedMovie);

    return this.movieRepository.save(updatedMovie);
  }

  async remove(id: string) {
    const parsedId = Number(id);
  if (isNaN(parsedId)) {
    throw new BadRequestException(`Invalid ID: ${id}`);
  }
    const exists = await this.movieRepository.findOneBy({ id: parsedId });
    if (!exists) {
      throw new NotFoundException(`Movie with ID ${id} not found`);
    }
    return this.movieRepository.delete(parsedId);
  }

  async updateByTitle(title: string, dto: UpdateMovieDto) {
    const movie = await this.movieRepository.findOneBy({ title });
    if (!movie) {
      throw new NotFoundException(`Movie with title "${title}" not found`);
    }
    return this.update(movie.id.toString(), dto);
  }

  async deleteByTitle(title: string) {
    const movie = await this.movieRepository.findOneBy({ title });
    if (!movie) {
      throw new NotFoundException(`Movie with title "${title}" not found`);
    }
    return this.movieRepository.delete({ title });
  }
}

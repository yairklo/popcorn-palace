import { BadRequestException } from '@nestjs/common';
import { Movie } from '../entities/movie.entity';

export function validateMovieDuration(movie: Partial<Movie>) {
  if (movie.duration === undefined) {
    throw new BadRequestException('Duration is required');
  }
  if (movie.duration <= 0) {
    throw new BadRequestException('Duration must be greater than zero');
  }
}

export function validateReleaseYear(movie: Partial<Movie>) {
  const currentYear = new Date().getFullYear();
  if (movie.releaseYear !== undefined && movie.releaseYear > currentYear) {
    throw new BadRequestException(
      `Release year cannot be in the future (max: ${currentYear})`,
    );
  }
}

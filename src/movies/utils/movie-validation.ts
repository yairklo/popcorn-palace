import { BadRequestException, ConflictException } from '@nestjs/common';
import { Movie } from '../entities/movie.entity';
import { Repository } from 'typeorm';

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

export async function validateMovieTitleUniqueness(
  repo: Repository<Movie>, 
  title: string,
  currentId?: number
) {
  const existing = await repo.findOneBy({ title });
  if (existing && existing.id !== currentId) {
    throw new ConflictException(`Movie with title "${title}" already exists`);
  }
}

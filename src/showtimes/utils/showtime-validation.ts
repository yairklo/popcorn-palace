import { Repository } from 'typeorm/repository/Repository';
import { Showtime } from '../entities/showtime.entity';
import { LessThan } from 'typeorm/find-options/operator/LessThan';
import { MoreThan } from 'typeorm/find-options/operator/MoreThan';
import { Not } from 'typeorm/find-options/operator/Not';
import { Movie } from 'src/movies/entities/movie.entity';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

export function validateShowtimeChronology(start: Date, end: Date) {
  if (end <= start) {
    throw new BadRequestException('end_time must be after start_time');
  }
}

export function validateShowtimeDuration(
  start: Date,
  end: Date,
  minMinutes: number,
) {
  const minutes = (end.getTime() - start.getTime()) / 60000;
  if (minutes < minMinutes) {
    throw new BadRequestException(
      `Showtime duration (${Math.floor(minutes)} min) is shorter than movie duration (${minMinutes} min)`,
    );
  }
}

export async function validateShowtimeOverlap(
  showtimeRepository: Repository<Showtime>,
  theater: string,
  start: Date,
  end: Date,
  excludeId?: number,
) {
  const overlap = await showtimeRepository.findOne({
    where: {
      theater: theater,
      startTime: LessThan(end),
      endTime: MoreThan(start),
      ...(excludeId ? { id: Not(excludeId) } : {}),
    },
  });

  if (overlap) {
    throw new ConflictException(
      'Another showtime already exists in this theater during the selected time',
    );
  }
}

export async function resolveMovie(
  movieRepository: Repository<Movie>,
  movieId: number,
): Promise<Movie> {
  const movie = await movieRepository.findOneBy({ id: movieId });
  if (!movie) {
    throw new NotFoundException(`Movie with ID ${movieId} not found`);
  }
  return movie;
}

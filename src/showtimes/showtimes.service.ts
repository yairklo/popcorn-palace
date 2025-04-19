import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Showtime } from './entities/showtime.entity';
import { Movie } from '../movies/entities/movie.entity';
import {
  resolveMovie,
  validateShowtimeChronology,
  validateShowtimeDuration,
  validateShowtimeOverlap,
} from './utils/showtime-validation';
import { CreateShowtimeDto, UpdateShowtimeDto } from './dto/showtime.dto';
import { Ticket } from 'src/tickets/entities/ticket.entity';

@Injectable()
export class ShowtimesService {
  constructor(
    @InjectRepository(Showtime)
    private showtimeRepository: Repository<Showtime>,
    @InjectRepository(Movie)
    private movieRepository: Repository<Movie>,
    @InjectRepository(Ticket)
    private ticketRepository: Repository<Ticket>,
  ) {}

  findAll() {
    return this.showtimeRepository.find();
  }

  async findById(id: string) {
    const showtime = await this.movieRepository.findOneBy({ id: Number(id) });
    if (!showtime) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
    return this.showtimeRepository.findOne({
      where: { id: Number(id) },
      relations: ['theater', 'movie'],
    });
  }

  async findByMovieId(movieId: number) {
    const movie = await this.movieRepository.findOneBy({ id: movieId });
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }
    return this.showtimeRepository.find({
      where: { movie: { id: movieId } },
      relations: ['theater'],
    });
  }

  async create(showtime: CreateShowtimeDto) {
    const movie = await resolveMovie(this.movieRepository, showtime.movieId);

    const start = new Date(showtime.startTime);
    const end = new Date(showtime.endTime);

    validateShowtimeChronology(start, end);
    validateShowtimeDuration(start, end, movie.duration);
    await validateShowtimeOverlap(
      this.showtimeRepository,
      showtime.theater,
      start,
      end,
    );

    const newShowtime = this.showtimeRepository.create({
      ...showtime,
      movie,
    });
    return this.showtimeRepository.save(newShowtime);
  }

  async update(id: string, showtime: UpdateShowtimeDto) {
    const existing = await this.showtimeRepository.findOne({
      where: { id: Number(id) },
      relations: ['movie'],
    });

    if (!existing) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }

    const movie = showtime.movieId
      ? await resolveMovie(this.movieRepository, showtime.movieId)
      : existing.movie;

    const updatedShowtime = {
      ...existing,
      ...showtime,
      movie,
    };

    const start = new Date(updatedShowtime.startTime);
    const end = new Date(updatedShowtime.endTime);

    validateShowtimeChronology(start, end);
    validateShowtimeDuration(start, end, movie.duration);
    await validateShowtimeOverlap(
      this.showtimeRepository,
      showtime.theater,
      start,
      end,
      Number(id),
    );

    return this.showtimeRepository.save(updatedShowtime);
  }

  async remove(id: string) {
    const exists = await this.showtimeRepository.findOneBy({ id: Number(id) });
    if (!exists) {
      throw new NotFoundException(`Showtime with ID ${id} not found`);
    }
    this.showtimeRepository.delete(id);
  }
}

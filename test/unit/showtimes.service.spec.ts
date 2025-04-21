import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { ShowtimesService } from 'src/showtimes/showtimes.service';
import { Showtime } from 'src/showtimes/entities/showtime.entity';
import { Movie } from 'src/movies/entities/movie.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';

const plusMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60_000);

const mockRepo = () =>
  ({
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  }) as unknown as jest.Mocked<Repository<any>>;

let service: ShowtimesService;
let repoShowtime: jest.Mocked<Repository<Showtime>>;
let repoMovie: jest.Mocked<Repository<Movie>>;
let repoTicket: jest.Mocked<Repository<Ticket>>;

describe('ShowtimesService (unit)', () => {
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShowtimesService,
        { provide: getRepositoryToken(Showtime), useValue: mockRepo() },
        { provide: getRepositoryToken(Movie), useValue: mockRepo() },
        { provide: getRepositoryToken(Ticket), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(ShowtimesService);
    repoShowtime = module.get(getRepositoryToken(Showtime));
    repoMovie = module.get(getRepositoryToken(Movie));
    repoTicket = module.get(getRepositoryToken(Ticket));
  });

  afterEach(() => jest.resetAllMocks());

  it('creates valid showtime', async () => {
    // movie of 140 min
    repoMovie.findOneBy.mockResolvedValue({
      id: 1,
      duration: 140,
    } as Movie);

    repoShowtime.findOne.mockResolvedValue(null);

    const start = new Date();
    const end = plusMinutes(start, 150); // > movie duration

    await service.create({
      movieId: 1,
      theater: 'Hall‑A',
      price: 35,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });

    expect(repoShowtime.create).toHaveBeenCalled();
    expect(repoShowtime.save).toHaveBeenCalled();
  });

  it('rejects showtime shorter than movie', async () => {
    repoMovie.findOneBy.mockResolvedValue({
      id: 1,
      duration: 140,
    } as Movie);

    repoShowtime.findOne.mockResolvedValue(null);

    const start = new Date();
    const end = plusMinutes(start, 60);

    await expect(
      service.create({
        movieId: 1,
        theater: 'Hall‑A',
        price: 35,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects overlapping showtime in same theater', async () => {
    repoMovie.findOneBy.mockResolvedValue({
      id: 1,
      duration: 140,
    } as Movie);

    const start = new Date();
    const end = plusMinutes(start, 160);

    repoShowtime.findOne.mockResolvedValue(null);
    await service.create({
      movieId: 1,
      theater: 'Hall‑A',
      price: 35,
      startTime: start.toISOString(),
      endTime: end.toISOString(),
    });

    (repoShowtime.findOne as jest.Mock).mockResolvedValueOnce({ id: 99 });

    const overlappedStart = plusMinutes(start, 30);
    const overlappedEnd = plusMinutes(overlappedStart, 160);

    await expect(
      service.create({
        movieId: 1,
        theater: 'Hall‑A',
        price: 35,
        startTime: overlappedStart.toISOString(),
        endTime: overlappedEnd.toISOString(),
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});

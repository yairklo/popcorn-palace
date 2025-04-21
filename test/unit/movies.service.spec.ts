import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MoviesService } from 'src/movies/movies.service';
import { Movie } from 'src/movies/entities/movie.entity';

const mockRepo = () => ({
  find: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('MoviesService (unit)', () => {
  let service: MoviesService;
  let repo: jest.Mocked<Repository<Movie>>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: mockRepo() },
      ],
    }).compile();

    service = module.get(MoviesService);
    repo = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => jest.clearAllMocks());

  // ---------- helpers --------------------------------------------------------
  const sampleMovie = {
    id: 1,
    title: 'Inception',
    genre: 'Sci‑Fi',
    duration: 148,
    rating: 8.8,
    releaseYear: 2010,
  } as Movie;

  // ---------------------------------------------------------------------------

  describe('create()', () => {
    it('creates movie when title unique & year valid', async () => {
      repo.findOneBy.mockResolvedValueOnce(null); // title uniqueness
      repo.create.mockReturnValueOnce(sampleMovie);
      repo.save.mockResolvedValueOnce(sampleMovie);

      const res = await service.create(sampleMovie);
      expect(res).toEqual(sampleMovie);
      expect(repo.create).toHaveBeenCalledWith(sampleMovie);
    });

    it('throws ConflictException on duplicate title', async () => {
      repo.findOneBy.mockResolvedValueOnce(sampleMovie); // title exists
      await expect(service.create(sampleMovie)).rejects.toBeInstanceOf(
        ConflictException,
      );
    });

    it('throws BadRequest on future releaseYear', async () => {
      const future = {
        ...sampleMovie,
        releaseYear: new Date().getFullYear() + 10,
      };
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.create(future)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('updateByTitle()', () => {
    it('updates movie when title is unique', async () => {
      // 1) find by old title
      repo.findOneBy
        .mockResolvedValueOnce(sampleMovie)
        // 2) find by id   (inside update())
        .mockResolvedValueOnce(sampleMovie)
        // 3) duplicate‑check for *new* title
        .mockResolvedValueOnce(null);

      repo.save.mockResolvedValueOnce({ ...sampleMovie, title: 'New' });

      const res = await service.updateByTitle('Inception', { title: 'New' });
      expect(res.title).toBe('New');
      expect(repo.save).toHaveBeenCalled();
    });

    it('throws ConflictException when new title already exists', async () => {
      repo.findOneBy
        .mockResolvedValueOnce(sampleMovie) // by old title
        .mockResolvedValueOnce(sampleMovie) // by id
        .mockResolvedValueOnce({
          id: 2,
          title: 'New',
          genre: 'Drama',
          duration: 120,
          rating: 7.5,
          releaseYear: 2011,
          showtimes: [],
        } as Movie); // duplicate title

      await expect(
        service.updateByTitle('Inception', { title: 'New' }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('deleteByTitle()', () => {
    it('returns 404 when title not found', async () => {
      repo.findOneBy.mockResolvedValueOnce(null);
      await expect(service.deleteByTitle('None')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('deletes movie successfully', async () => {
      repo.findOneBy.mockResolvedValueOnce(sampleMovie);
      repo.delete.mockResolvedValueOnce({ affected: 1 } as any);

      await service.deleteByTitle('Inception');
      expect(repo.delete).toHaveBeenCalledWith({ title: 'Inception' });
    });
  });
});

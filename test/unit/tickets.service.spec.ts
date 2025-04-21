import { Test } from '@nestjs/testing';
import { TicketsService } from 'src/tickets/tickets.service';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Showtime } from 'src/showtimes/entities/showtime.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, BadRequestException } from '@nestjs/common';
import { ShowtimesService } from 'src/showtimes/showtimes.service';

const repoMock = () => ({
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
});

describe('TicketsService (unit)', () => {
  let service: TicketsService;
  let ticketRepo: any;
  let showRepo: any;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TicketsService,
        { provide: getRepositoryToken(Ticket), useValue: repoMock() },
        { provide: getRepositoryToken(Showtime), useValue: repoMock() },
        { provide: ShowtimesService,            useValue: { findById: jest.fn() } },
      ],
    }).compile();

    service = module.get(TicketsService);
    ticketRepo = module.get(getRepositoryToken(Ticket));
    showRepo = module.get(getRepositoryToken(Showtime));

    showRepo.findOneBy.mockResolvedValue({
      id: 1,
      startTime: new Date(Date.now() + 3_600_000), // 1h in future
      endTime: new Date(Date.now() + 5_600_000),
    });
  });

  it('books seat successfully', async () => {
    ticketRepo.findOne.mockResolvedValue(null);
    ticketRepo.create.mockImplementation((dto) => dto);
    ticketRepo.save.mockImplementation((t) => ({ bookingId: 1, ...t }));

    const res = await service.create({
      showtimeId: 1,
      seatNumber: 5,
      userId: 'user‑1',
    });

    expect(res.bookingId).toBe(1);
  });

  it('throws ConflictException on duplicate seat', async () => {
    ticketRepo.findOne.mockResolvedValue({ bookingId: 99 });

    await expect(
      service.create({ showtimeId: 1, seatNumber: 5, userId: 'u2' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws BadRequest if showtime already ended', async () => {
    showRepo.findOneBy.mockResolvedValueOnce({
      id: 2,
      startTime: new Date(Date.now() - 4_600_000),
      endTime: new Date(Date.now() - 3_600_000),
    });

    await expect(
      service.create({ showtimeId: 2, seatNumber: 3, userId: 'late' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

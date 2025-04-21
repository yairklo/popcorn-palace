import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ticket } from './entities/ticket.entity';
import { CreateTicketDto } from './dto/tickets.dto';
import { validateTicketBooking } from './utils/ticket-validation';
import { Showtime } from 'src/showtimes/entities/showtime.entity';
import { ShowtimesService } from 'src/showtimes/showtimes.service';

@Injectable()
export class TicketsService {
  constructor(
    @InjectRepository(Ticket)
    private TicketRepository: Repository<Ticket>,
    @InjectRepository(Showtime)
    private ShowtimeRepository: Repository<Showtime>,
    private showtimesService: ShowtimesService,
  ) {}
  async create(ticket: CreateTicketDto) {
    const showtime = await this.ShowtimeRepository.findOneBy({
      id: ticket.showtimeId,
    });
    if (!showtime) {
      throw new NotFoundException(
        `Showtime with ID ${ticket.showtimeId} not found`,
      );
    }
    const exists = await this.TicketRepository.findOne({
      where: {
        showtime: { id: ticket.showtimeId },
        seatNumber: ticket.seatNumber,
      },
      relations: ['showtime'],
    });

    if (exists) {
      throw new ConflictException('Seat is already booked for this showtime');
    }
    validateTicketBooking({
      showtime,
      seat_number: ticket.seatNumber,
    });

    const newBooking = this.TicketRepository.create({
      userId: ticket.userId,
      seatNumber: ticket.seatNumber,
      showtime: { id: ticket.showtimeId },
    });
    const saved = await this.TicketRepository.save(newBooking);
    return { bookingId: saved.bookingId };
  }

  async remove(id: string) {
    const exists = await this.TicketRepository.findOneBy({
      bookingId: Number(id),
    });
    if (!exists) {
      throw new NotFoundException(`Ticket with ID ${id} not found`);
    }
    return this.TicketRepository.delete(id);
  }

  findAll() {
    return this.TicketRepository.find();
  }
}

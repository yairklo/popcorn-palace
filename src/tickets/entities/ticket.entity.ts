import { Showtime } from 'src/showtimes/entities/showtime.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Unique,
} from 'typeorm';

@Entity()
@Unique(['showtime', 'seatNumber'])
export class Ticket {
  @PrimaryGeneratedColumn()
  bookingId: number;

  @Column()
  seatNumber: number;

  @Column()
  userId: string;

  @ManyToOne(() => Showtime, (showtime) => showtime.tickets, {
    onDelete: 'CASCADE',
  })
  showtime: Showtime;
}

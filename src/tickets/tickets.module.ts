import { Module } from '@nestjs/common';
import { Ticket } from './entities/ticket.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Showtime } from 'src/showtimes/entities/showtime.entity';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';
import { ShowtimesModule } from 'src/showtimes/showtimes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Showtime, Ticket]),
  ShowtimesModule,
  ],
  controllers: [TicketsController],
  providers: [TicketsService],
})
export class TicketsModule {}

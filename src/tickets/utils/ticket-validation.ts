import { BadRequestException, Logger } from '@nestjs/common';
import { Ticket } from '../entities/ticket.entity';

export function validateTicketBooking({
  showtime,
  seat_number,
}: {
  showtime: { startTime: string | Date; endTime: string | Date };
  seat_number: number;
}) {
  if (!showtime) {
    throw new BadRequestException('Showtime is required');
  }

  if (typeof seat_number !== 'number' || seat_number <= 0) {
    throw new BadRequestException('Seat number must be a positive number');
  }

  const now = new Date();
  const start = new Date(showtime.startTime);
  const end = new Date(showtime.endTime);

  if (end <= now) {
    throw new BadRequestException(
      'Cannot book a ticket for a showtime that has already ended',
    );
  }

  if (start <= now) {
    Logger.warn(
      `Customer is booking a ticket for a showtime that has already started (started at ${start.toISOString()})`,
      'TicketValidation',
    );
  }
}

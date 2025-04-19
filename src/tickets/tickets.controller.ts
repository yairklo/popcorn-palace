import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto } from './dto/tickets.dto';

@Controller('bookings')
export class TicketsController {
  constructor(private readonly TicketsService: TicketsService) {}


  @Post()
  @HttpCode(200)
  create(@Body() ticket: CreateTicketDto) {
    return this.TicketsService.create(ticket);
  }
}

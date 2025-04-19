import { IsNumber, isString, IsString, Min } from 'class-validator';

export class CreateTicketDto {
  @IsNumber()
  showtimeId: number;

  @IsString()
  userId: string

  @IsNumber()
  @Min(1)
  seatNumber: number;
}


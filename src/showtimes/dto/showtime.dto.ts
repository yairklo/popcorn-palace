import { PartialType } from '@nestjs/mapped-types';
import {
  IsNumber,
  IsDateString,
  Min,
  IsPositive,
  ValidateIf,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validate,
  IsString,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsEndAfterStart', async: false })
export class IsEndAfterStartConstraint implements ValidatorConstraintInterface {
  validate(end_time: string, args: ValidationArguments) {
    const dto = args.object as any;
    if (!dto.start_time || !end_time) return true; // skip if either is missing
    return new Date(end_time) > new Date(dto.start_time);
  }

  defaultMessage(args: ValidationArguments) {
    return 'end_time must be after start_time';
  }
}

export class CreateShowtimeDto {
  @IsNumber()
  movieId: number;

  @IsString()
  theater: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  @Validate(IsEndAfterStartConstraint)
  endTime: string;

  @IsNumber()
  @IsPositive()
  @Min(0)
  price: number;
}

export class UpdateShowtimeDto extends PartialType(CreateShowtimeDto) {}

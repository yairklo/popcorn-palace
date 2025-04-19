import { IsString, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/mapped-types';

export class CreateMovieDto {
  @IsString()
  title: string;

  @IsString()
  genre: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  duration: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  rating: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1800)
  releaseYear: number;
}

export class UpdateMovieDto extends PartialType(CreateMovieDto) {}

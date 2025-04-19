import { Module } from '@nestjs/common';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Movie } from './entities/movie.entity';
import { ShowtimesModule } from 'src/showtimes/showtimes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Movie]), ShowtimesModule],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}

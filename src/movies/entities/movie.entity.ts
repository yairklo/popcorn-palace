import { Showtime } from 'src/showtimes/entities/showtime.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, Unique } from 'typeorm';

@Entity()
@Unique(['title'])
export class Movie {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  genre: string;

  @Column()
  duration: number;

  @Column('decimal', { precision: 3, scale: 1 })
  rating: number;

  @Column()
  releaseYear: number;

  @OneToMany(() => Showtime, (showtime) => showtime.movie)
  showtimes: Showtime[];
}

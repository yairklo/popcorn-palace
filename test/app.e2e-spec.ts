import * as request from 'supertest';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

// Utilities ---------------------------------------------------------------
function tomorrow(hoursAhead = 1) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(d.getHours() + hoursAhead);
  return d.toISOString();
}
 
function plusMinutes(iso: string, minutes: number) {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
}

//--------------------------------------------------------------------------

describe('Popcorn‑Palace E2E (Jest/Supertest)', () => {
  let app: INestApplication;
  let server: any;

  // IDs that later tests depend on
  let movieId: number;
  let showtimeId: number;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  // 1. Create movie – valid ------------------------------------------------
  it('creates a movie successfully', async () => {
    const res = await request(server)
      .post('/movies')
      .send({
        title: 'Inception',
        genre: 'Sci‑Fi',
        duration: 148,
        rating: 8.8,
        releaseYear: 2010,
      })
      .expect(200);

    expect(res.body.title).toBe('Inception');
    movieId = res.body.id;
  });

  // 2. Create movie – duplicate title -------------------------------------
  it('rejects duplicate movie title', async () => {
    await request(server)
      .post('/movies')
      .send({
        title: 'Inception',
        genre: 'Drama',
        duration: 120,
        rating: 7,
        releaseYear: 2011,
      })
      .expect(409);
  });

  // 3. Create movie – future year ----------------------------------------
  it('rejects movie with future releaseYear', async () => {
    const nextYear = new Date().getFullYear() + 2;
    await request(server)
      .post('/movies')
      .send({
        title: 'Future‑Movie',
        genre: 'Sci‑Fi',
        duration: 100,
        rating: 6,
        releaseYear: nextYear,
      })
      .expect(400);
  });

  // 4. Get all movies ------------------------------------------------------
  it('lists movies', async () => {
    const res = await request(server).get('/movies/all').expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  // 5. Create showtime – valid -------------------------------------------
  it('creates a valid showtime', async () => {
    const start = tomorrow();
    const end = plusMinutes(start, 160); // longer than movie duration

    const res = await request(server)
      .post('/showtimes')
      .send({
        movieId,
        theater: 'Hall‑A',
        price: 35.5,
        startTime: start,
        endTime: end,
      })
      .expect(200);

    showtimeId = res.body.id;
  });

  // 6. Create showtime – too short ---------------------------------------
  it('rejects showtime shorter than movie duration', async () => {
    const start = tomorrow(3);
    const end = plusMinutes(start, 60); // 1 hour only

    await request(server)
      .post('/showtimes')
      .send({ movieId, theater: 'Hall‑A', price: 30, startTime: start, endTime: end })
      .expect(400);
  });

  // 7. Create showtime – overlapping in same theater ----------------------
  it('rejects overlapping showtime in the same theater', async () => {
    const start = tomorrow(); // overlaps with first showtime
    const end = plusMinutes(start, 180);

    await request(server)
      .post('/showtimes')
      .send({ movieId, theater: 'Hall‑A', price: 30, startTime: start, endTime: end })
      .expect(409);
  });

  // 8. Get showtime by id --------------------------------------------------
  it('fetches showtime by id', async () => {
    const res = await request(server).get(`/showtimes/${showtimeId}`).expect(200);
    expect(res.body.id).toBe(showtimeId);
  });

  // 9. Update showtime price ---------------------------------------------
  it('updates showtime price', async () => {
    const res = await request(server)
      .post(`/showtimes/update/${showtimeId}`)
      .send({ price: 45 })
      .expect(200);
    expect(res.body.price).toBe(45);
  });

  // 10. Book ticket – valid ----------------------------------------------
  it('books a valid seat', async () => {
    const res = await request(server)
      .post('/bookings')
      .send({ showtimeId, seatNumber: 10, userId: 'tester‑1' })
      .expect(200);
    expect(res.body.bookingId).toBeDefined();
  });

  // 11. Book ticket – duplicate seat -------------------------------------
  it('rejects booking same seat twice', async () => {
    await request(server)
      .post('/bookings')
      .send({ showtimeId, seatNumber: 10, userId: 'tester‑2' })
      .expect(409);
  });

  // 12. Book ticket – showtime ended -------------------------------------
  it('rejects booking for past showtime', async () => {
    // create a past showtime first
    const pastEnd   = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const pastStart = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();
    const past = await request(server)
      .post('/showtimes')
      .send({ movieId, theater: 'Hall‑B', price: 25, startTime: pastStart, endTime: pastEnd })
      .expect(200);

    await request(server)
      .post('/bookings')
      .send({ showtimeId: past.body.id, seatNumber: 5, userId: 'late‑user' })
      .expect(400);
  });

  // 13. Delete movie – not found -----------------------------------------
  it('returns 404 when deleting non‑existing movie by title', async () => {
    await request(server).delete('/movies/NonExistingTitle').expect(404);
  });

  // 14. Delete movie – cascade showtimes & tickets -----------------------
  it('deletes movie and cascades showtimes/tickets', async () => {
    await request(server).delete('/movies/Inception').expect(200);
    await request(server).get(`/showtimes/${showtimeId}`).expect(404);
  });
});

How to run build and test the project:

start Postgres in Docker:
$ docker compose up -d  # uses compose.yml (DB on port 5432)

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

Building for Production:

$ npm run build          # compiles TS → JS (dist/)
$ npm prune --production  # install prod deps only
$ node dist/main.js       # or use pm2 / docker

A minimal Dockerfile is included – build with docker build -t popcorn-palace . and run docker run -p 3000:3000 popcorn-palace (expects an external Postgres DB or link a service under DB_HOST).


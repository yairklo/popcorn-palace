Popcorn Palace – Quick Start Guide

Prerequisites

Node.js ≥ 18 & npm

Docker (for Postgres)

0 · Environment file (.env)

Create a file named .env in the project root before running any command:

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=popcorn-palace
DB_PASSWORD=popcorn-palace
DB_NAME=popcorn-palace

(Feel free to tweak these if your local Postgres uses different credentials or port.)

1 · Database

docker compose up -d   # starts the Postgres service on :5432 defined in compose.yml

2 · Install & Run

npm install            # install deps

# development
npm run start          # localhost:3000

# live‑reload
npm run start:dev

# production (uses dist/)
npm run start:prod

3 · Build for Production

npm run build          # compile TS → dist/
npm prune --production # keep only prod deps
node dist/main.js      # or pm2 / Docker

A minimal Dockerfile is included:

docker build -t popcorn-palace .
docker run -p 3000:3000 popcorn-palace   # set DB_HOST env var if DB is external

4 · Tests

# unit tests (Jest)
npm run test

# e2e tests (Jest + Supertest)
npm run test:e2e

# coverage report
npm run test:cov

5 · Adding More Jest Tests

Purpose

File pattern

Location

Unit / integration

*.spec.ts

test/unit or alongside source

End‑to‑end (REST)

*.e2e-spec.ts

test/e2e

New files matching those patterns are discovered automatically by the npm scripts above.
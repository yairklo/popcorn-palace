Popcorn Palace — Quick Start Guide
Prerequisites
Node.js ≥ 18 (with npm)

Docker (to run the bundled PostgreSQL)

0 · Environment file (.env)
Create a file called .env in the project root before running any command:

ini
Copy
Edit
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=popcorn-palace
DB_PASSWORD=popcorn-palace
DB_NAME=popcorn-palace
(Edit the values if your local Postgres uses different credentials or ports.)

1 · Database
bash
Copy
Edit
docker compose up -d
Starts the Postgres container defined in compose.yml on port 5432.

2 · Install & Run
bash
Copy
Edit
npm install            # install dependencies

# development server – http://localhost:3000
npm run start

# live-reload
npm run start:dev

# production (runs the compiled dist/)
npm run start:prod
3 · Build for Production
bash
Copy
Edit
npm run build            # compile TS → dist/
npm prune --production   # remove dev dependencies
node dist/main.js        # or pm2 / Docker
A minimal Dockerfile is provided:

bash
Copy
Edit
docker build -t popcorn-palace .
docker run -p 3000:3000 \
  -e DB_HOST=<external-db-host> \
  popcorn-palace
(omit DB_HOST if you use the bundled Postgres container).

4 · Tests
bash
Copy
Edit
# unit tests (Jest)
npm run test

# e2e tests (Jest + Supertest)
npm run test:e2e

# coverage report
npm run test:cov
5 · Adding More Jest Tests

Purpose	File pattern	Location (suggested)
Unit / integration tests	*.spec.ts	test/unit or near source
REST end-to-end tests	*.e2e-spec.ts	test/e2e
Files matching these patterns are discovered automatically by the npm scripts above.

Enjoy!
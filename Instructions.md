# Popcorn Palace — Quick Start Guide

## Prerequisites

First, clone the repository locally (if you haven’t already):

**Run in terminal:**
```bash
git clone https://github.com/yairklo/popcorn‑palace.git
cd popcorn‑palace
```

- **Node.js ≥ 18** (includes `npm`)
- **Docker** (to run the bundled PostgreSQL)

---

## 0 · Environment file (`.env`)
Create a file called **`.env`** in the project root **before** running any command:

```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=popcorn-palace
DB_PASSWORD=popcorn-palace
DB_NAME=popcorn-palace
```

> Change the values if your local Postgres uses different credentials or ports.

---

## 1 · Database
**Run in terminal:**
```bash
docker compose up -d
```
Starts the Postgres container defined in **compose.yml** on **port 5432**.

---

## 2 · Install & Run
**Run in terminal:**
```bash
npm install          # install dependencies
```

### Start the server
**Run in terminal:**
```bash
# development – http://localhost:3000
npm run start
```

### Live‑reload
**Run in terminal:**
```bash
npm run start:dev
```

### Production build
**Run in terminal:**
```bash
npm run start:prod   # runs the compiled dist/
```

---

## 3 · Build for Production
**Run in terminal:**
```bash
npm run build            # compile TS → dist/
npm prune --production   # remove dev dependencies
node dist/main.js        # or pm2 / Docker
```

A minimal **Dockerfile** is provided—build & run with:

**Run in terminal:**
```bash
docker build -t popcorn-palace .
docker run -p 3000:3000 \
  -e DB_HOST=<external-db-host> \
  popcorn-palace        # omit DB_HOST if you use the bundled Postgres container
```

---

## 4 · Tests
**Run in terminal:**
```bash
# unit tests (Jest)
npm run test

# e2e tests (Jest + Supertest)
npm run test:e2e

# coverage report
npm run test:cov
```

---

## 5 · Adding More Jest Tests

| Purpose                  | File pattern      | Suggested location                         |
| ------------------------ | ----------------- | ------------------------------------------ |
| Unit / integration tests | `*.spec.ts`       | `test/unit/` *or* near the source file     |
| REST end‑to‑end tests    | `*.e2e-spec.ts`   | `test/e2e/`                                |

Any new file that matches these patterns is discovered automatically by the **npm** scripts above.

---

Enjoy! 🚀


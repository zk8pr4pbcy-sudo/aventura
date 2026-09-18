# Aventura Backend

Server-side workspace for the Aventura Management System.

This foundation intentionally has no production database credentials, no admin login, and no public form migration yet. The current website remains unchanged while backend capabilities are built and tested in isolation.

## Current executable surface

- `GET /health` — process health endpoint.
- strict configuration validation for `PORT`.
- zero external runtime dependencies in the foundation commit.
- Node built-in test coverage for the health endpoint.

## Local checks

```sh
cd backend
npm run check
npm test
npm start
```

The next implementation stage is the database schema/migration layer, followed by request persistence. Provider-specific code must not be added until the database/runtime provider decision is recorded.

# Deployment Guide

The project now uses a single root `.env`, a single Express server locally, and one Vercel deployment for the whole app.

## Local Setup

1. Install dependencies in the two package folders if needed.
2. Copy the shared env file from [ .env.example ](.env.example) to `.env`.
3. Run `npm run build` from the repo root to build the frontend into `public/`.
4. Run `npm start` from the repo root to start the single server on port `3003`.

## Required Environment Variables

Use the root `.env` file:

```bash
MONGO_URI=
JWT_SECRET=
FRONTEND_URL=
APP_URL=
BREVO_SMTP_HOST=
BREVO_SMTP_PORT=
BREVO_SMTP_USER=
BREVO_SMTP_PASS=
BREVO_FROM_EMAIL=
BREVO_FROM_NAME=
SENTRY_DSN=
VITE_SENTRY_DSN=
PORT=3003
NODE_ENV=production
CORS_ORIGIN=
```

## Vercel Deployment

Deploy the repo as one Vercel project from the root.

Settings:
- Build command: `npm run build`
- Output directory: `public`
- API entrypoint: [api/[...all].js](api/%5B...all%5D.js)

Vercel environment variables:
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL`
- `APP_URL`
- `BREVO_SMTP_HOST`
- `BREVO_SMTP_PORT`
- `BREVO_SMTP_USER`
- `BREVO_SMTP_PASS`
- `BREVO_FROM_EMAIL`
- `BREVO_FROM_NAME`
- `SENTRY_DSN`
- `VITE_SENTRY_DSN`
- `CORS_ORIGIN`

## How It Works

- The frontend is built into `public/`.
- Express serves the compiled frontend and the API from the same origin.
- The browser talks to `/api/...`, so no separate frontend API host is needed.
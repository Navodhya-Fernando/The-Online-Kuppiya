# The Online Kuppiya

A modern Q&A platform for Sri Lankan university students to ask questions, share knowledge, and collaborate in their academic journey.

## Features

- Student-focused Q&A platform
- Smart search and filtering
- User authentication
- Leaderboard system
- Modern UI/UX
- Mobile responsive layout

## Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- Dotenv with a single root `.env`

### Deployment
- One Vercel project for the whole app

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB database

### Single Server Setup

```bash
# Install dependencies in the app folders if needed
cd frontend && npm install
cd ../backend && npm install

# Return to the repo root
cd ..

# Create the shared env file
cp .env.example .env

# Build the frontend into /public
npm run build

# Start the single server
npm start
```

The app will be available at http://localhost:3003.

## Environment Variables

Create one `.env` file in the project root:

```bash
MONGO_URI=mongodb://localhost:27017/the-online-kuppiya
JWT_SECRET=your-super-secure-jwt-secret
FRONTEND_URL=http://localhost:3003
APP_URL=http://localhost:3003
BREVO_SMTP_HOST=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USER=your-brevo-smtp-login
BREVO_SMTP_PASS=your-brevo-smtp-key
BREVO_FROM_EMAIL=no-reply@your-domain.com
BREVO_FROM_NAME=The Online Kuppiya
SENTRY_DSN=
VITE_SENTRY_DSN=
PORT=3003
NODE_ENV=development
CORS_ORIGIN=http://localhost:3003
```

## Development Scripts

### Root Commands

```bash
npm start          # Build the frontend and start the single server
npm run dev        # Same as start for local development
npm run build      # Build the frontend into the shared public folder
```

### Frontend Commands

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint
```

### Backend Commands

```bash
npm --prefix backend run dev:local
npm --prefix backend run start:local
```

## Database Utilities

```bash
node backend/create-admin-user.js
node backend/list-users.js
node backend/set-admin.js
node backend/cleanup-database.js
```

## Project Structure

```text
The-Online-Kuppiya/
├── api/               # Vercel API entrypoint
├── backend/           # Express API and database logic
├── frontend/          # React source code
├── public/            # Built frontend output served by Express and Vercel
├── .env.example       # Shared env example for frontend and backend
└── package.json       # Root scripts
```

## Deployment

Deploy the repository as one Vercel project from the root.

- Build command: `npm run build`
- Static frontend output: `public/`
- API entrypoint: [api/[...all].js](api/%5B...all%5D.js)

Set these environment variables in Vercel:

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

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/questions`
- `POST /api/questions`
- `GET /api/questions/:id`
- `GET /api/leaderboard`

## License

ISC
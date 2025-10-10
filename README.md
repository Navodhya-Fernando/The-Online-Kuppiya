# The Online Kuppiya

A modern Q&A platform for Sri Lankan university students to ask questions, share knowledge, and collaborate in their academic journey.

## Features

- 🎓 **Student-focused Q&A Platform** - Ask and answer academic questions
- 🔍 **Smart Search & Filtering** - Find relevant questions quickly
- 👥 **User Authentication** - Secure login and registration system
- 📊 **Leaderboard System** - Gamified learning experience
- 🎨 **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- 📱 **Mobile Responsive** - Works seamlessly on all devices

## Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Token authentication
- **Doppler** - Environment variable management

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MongoDB database
- Doppler CLI (for environment management)

### With Doppler (Recommended)

Terminal window 1 (Backend):

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server with Doppler
npm run dev
```

Terminal window 2 (Frontend):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Without Doppler

Terminal window 1 (Backend):

```bash
# Navigate to backend directory
cd backend

# Create .env file with required variables
cp .env.example .env
# Edit .env with your configuration

# Install dependencies
npm install

# Start development server
npm run dev:local
```

Terminal window 2 (Frontend):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```bash
# Database
MONGO_URI=mongodb://localhost:27017/the-online-kuppiya

# Authentication
JWT_SECRET=your-super-secure-jwt-secret

# AWS S3 (for file uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=your-aws-region
AWS_S3_BUCKET=your-s3-bucket-name

# Error Tracking (Optional)
SENTRY_DSN=your-sentry-dsn

# Server
PORT=3003
```

## Development Scripts

### Backend Commands

```bash
# Start with Doppler
npm start          # Production with Doppler
npm run dev        # Development with Doppler

# Start without Doppler
npm run start:local    # Production without Doppler
npm run dev:local      # Development without Doppler
```

### Frontend Commands

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Database Setup

### Create Admin User

```bash
# Navigate to backend directory
cd backend

# Create an admin user
node create-admin-user.js
```

### Database Utilities

```bash
# List all users
node list-users.js

# Set user as admin
node set-admin.js

# Clean up database
node cleanup-database.js
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Questions
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `GET /api/questions/:id` - Get specific question
- `POST /api/questions/:id/answers` - Add answer to question

### Leaderboard
- `GET /api/leaderboard` - Get user rankings

## Project Structure

```
The-Online-Kuppiya/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database configuration
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── services/          # External services
│   └── server.js          # Application entry point
├── frontend/               # React application
│   ├── public/            # Static assets
│   └── src/
│       ├── api/           # API client functions
│       ├── components/    # React components
│       ├── contexts/      # React contexts
│       ├── hooks/         # Custom hooks
│       └── pages/         # Page components
└── docs/                   # Documentation
```

## Deployment

### Production Build

Frontend:
```bash
cd frontend
npm run build
```

Backend:
```bash
cd backend
npm start
```

### Environment Setup

Make sure to set the following environment variables in your production environment:
- All variables from the `.env` example above
- Update `frontend/src/api/axios.js` with your production API URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue on GitHub or contact the development team.
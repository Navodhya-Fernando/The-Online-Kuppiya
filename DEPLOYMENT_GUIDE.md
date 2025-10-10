# Deployment Guide

Complete guide for deploying The Online Kuppiya platform to production environments.

## Prerequisites

- Node.js 16+ 
- MongoDB database (local or cloud)
- AWS S3 bucket for file storage
- Doppler account (optional, for environment management)

## Environment Configuration

### Required Environment Variables

Create a `.env` file in the backend directory:

```bash
# Database Configuration
MONGO_URI=mongodb://localhost:27017/the-online-kuppiya
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/database

# Authentication
JWT_SECRET=your-super-secure-random-string-min-32-characters
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Server Configuration
PORT=3003
NODE_ENV=production

# Optional: Error Tracking
SENTRY_DSN=your-sentry-dsn-url
```

## Local Development Setup

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Start development server
npm run dev:local
```

### Frontend Setup

```bash
# Navigate to frontend directory  
cd frontend

# Install dependencies
npm install

# Update API URL in src/api/axios.js
# Change baseURL to your backend URL

# Start development server
npm run dev
```

## Production Deployment

### Option 1: Traditional VPS/Server

Backend deployment:

```bash
# On your server
cd backend

# Install dependencies
npm install --production

# Install PM2 for process management
npm install -g pm2

# Start application
pm2 start server.js --name "kuppiya-backend"

# Save PM2 configuration
pm2 save
pm2 startup
```

Frontend deployment:

```bash
# Build frontend locally
cd frontend
npm run build

# Upload dist/ folder to your web server
# Configure nginx/apache to serve static files
```

### Option 2: Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3003:3003"
    environment:
      - NODE_ENV=production
    env_file:
      - ./backend/.env
    depends_on:
      - mongo

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

  mongo:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

Deploy with Docker:

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f
```

### Option 3: Cloud Platform Deployment

#### Heroku

Backend (create separate app):

```bash
# Install Heroku CLI and login
heroku create your-app-backend

# Set environment variables
heroku config:set MONGO_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
# ... add all other env vars

# Deploy
git subtree push --prefix backend heroku main
```

Frontend (create separate app):

```bash
# Create frontend app
heroku create your-app-frontend

# Add buildpack for static sites
heroku buildpacks:set heroku/nodejs

# Update API URL in frontend code to backend app URL
# Deploy
git subtree push --prefix frontend heroku main
```

#### Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

#### Vercel (Frontend only)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy from frontend directory
cd frontend
vercel --prod
```

## Database Setup

### Create Initial Admin User

```bash
# On your server/local environment
cd backend
node create-admin-user.js
```

### Database Management Commands

```bash
# List all users
node list-users.js

# Set user as admin
node set-admin.js

# Clean database
node cleanup-database.js
```

## Security Considerations

### Production Security Checklist

- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable CORS only for your domain
- [ ] Use HTTPS in production
- [ ] Set secure MongoDB credentials
- [ ] Configure AWS S3 bucket policies
- [ ] Enable rate limiting
- [ ] Add security headers (helmet.js)
- [ ] Update default ports in production
- [ ] Regular dependency updates

### Nginx Configuration Example

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Monitoring & Maintenance

### Health Check Endpoints

The backend includes health check at:
- `GET /health` - Basic server health
- `GET /api/health` - API and database health

### Log Management

```bash
# PM2 logs
pm2 logs kuppiya-backend

# Application logs location
tail -f /path/to/logs/app.log
```

### Backup Strategy

```bash
# MongoDB backup
mongodump --uri="your-mongodb-uri" --out=backup/

# S3 files are automatically backed up by AWS
# Consider versioning enabled on your bucket
```

## Troubleshooting

### Common Issues

**Database Connection Failed**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check network connectivity
telnet your-mongo-host 27017
```

**Frontend API Calls Failing**
- Verify backend URL in `frontend/src/api/axios.js`
- Check CORS configuration in backend
- Verify SSL certificates for HTTPS

**File Upload Issues**
- Verify AWS credentials and permissions
- Check S3 bucket CORS configuration
- Verify bucket region matches AWS_REGION

### Performance Optimization

```bash
# Enable gzip compression
npm install compression

# Add to backend server.js:
# app.use(require('compression')());

# Frontend build optimization
npm run build -- --mode production
```

## Support

For deployment issues, check:
1. Application logs
2. Database connectivity
3. Environment variables
4. Network/firewall settings
5. AWS S3 permissions

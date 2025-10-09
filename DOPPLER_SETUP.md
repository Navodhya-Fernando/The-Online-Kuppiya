# Doppler Setup Guide

## Prerequisites
- Doppler CLI installed ✅
- Doppler account created at https://dashboard.doppler.com

## Setup Steps

### 1. Initialize Doppler Project
```bash
# Navigate to your project root
cd /home/navodhya-fernando/The-Online-Kuppiya

# Login to Doppler (if not already logged in)
doppler login

# Setup the project
doppler setup
```

### 2. Create Environment Variables
Add these variables to your Doppler project via the web dashboard or CLI:

**Required Variables:**
- `NODE_ENV` = `development` (or `production`)
- `PORT` = `3003`
- `MONGODB_URI` = `mongodb://localhost:27017/online-kuppiya`
- `JWT_SECRET` = Your secure JWT secret key

**Optional Variables (based on your features):**
- AWS S3 credentials (if using file uploads)
- Email service credentials (if using email)
- SMS service credentials (if using SMS)

### 3. Add Variables via CLI
```bash
# Add variables one by one
doppler secrets set NODE_ENV=development
doppler secrets set PORT=3003
doppler secrets set MONGODB_URI=mongodb://localhost:27017/online-kuppiya
doppler secrets set JWT_SECRET=your-super-secret-jwt-key-here

# Or upload from a file
doppler secrets upload .env.example
```

### 4. Run Your Application
```bash
# Backend with Doppler
cd backend
npm run dev    # Uses: doppler run -- nodemon server.js
npm run start  # Uses: doppler run -- node server.js

# Or run without Doppler (fallback)
npm run dev:local    # Uses: nodemon server.js
npm run start:local  # Uses: node server.js
```

### 5. Verify Setup
Your application should now:
- Load environment variables from Doppler
- Connect to MongoDB
- Start the server on the configured port

## Commands Reference

```bash
# View current secrets
doppler secrets

# Download secrets to local .env file (for debugging)
doppler secrets download --no-file --format env

# Switch between environments
doppler configure set config production
doppler configure set config dev

# Run any command with Doppler
doppler run -- your-command-here
```

## Troubleshooting

1. **Authentication Issues**
   ```bash
   doppler login
   doppler configure
   ```

2. **Missing Variables**
   ```bash
   doppler secrets
   doppler secrets set VARIABLE_NAME=value
   ```

3. **Wrong Environment**
   ```bash
   doppler configure
   # Select correct project and config
   ```

4. **Fallback to Local Development**
   - Use `npm run dev:local` if Doppler is not working
   - Create a local `.env` file for development (not recommended for production)

## Security Best Practices

1. Never commit `.env` files to git
2. Use different Doppler configs for different environments (dev, staging, prod)
3. Regularly rotate sensitive credentials
4. Use Doppler's audit logs to monitor access
5. Set up proper access controls in Doppler dashboard

## Next Steps

1. Set up different environments (staging, production) in Doppler
2. Configure team access and permissions
3. Set up Doppler integrations for CI/CD pipelines
4. Enable audit logging and monitoring

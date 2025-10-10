# Backend Setup Requirements

## Core Dependencies

All required dependencies are already included in `package.json`. To install:

```bash
cd backend
npm install
```

## Additional Dependencies (If Needed)

### Authentication & File Upload
```bash
# Session management
npm install express-session

# File upload handling
npm install multer

# Email service
npm install nodemailer

# SMS service
npm install twilio
```

### Production Enhancements
```bash
# Rate limiting for API endpoints
npm install express-rate-limit

# Security headers
npm install helmet

# CORS support
npm install cors

# Response compression
npm install compression
```

## Environment Variables (.env file):

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret_here

# Session
SESSION_SECRET=your_session_secret_here

# Email Configuration (Nodemailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# WhatsApp/SMS Configuration (Twilio)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
TWILIO_PHONE_FROM=your_twilio_phone_number

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_PATH=./uploads/

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX=100           # limit each IP to 100 requests per windowMs
```

## Production Considerations:

1. **File Storage**: Consider using AWS S3 or similar cloud storage for uploaded files
2. **Email Service**: Use a dedicated email service like SendGrid, Mailgun, or AWS SES
3. **SMS/WhatsApp**: Twilio is recommended for production WhatsApp integration
4. **Session Storage**: Use Redis for session storage in production
5. **Security**: Add helmet, cors, and rate limiting middlewares

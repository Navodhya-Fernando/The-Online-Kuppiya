# 🚀 External OTP Services Setup Guide

## Quick Start (Free Options)

### Option 1: SendGrid Email (Recommended - Free)
1. **Sign up at SendGrid**: https://sendgrid.com/
2. **Get API Key**: 
   - Go to Settings → API Keys
   - Create new API key with "Full Access"
   - Copy the API key

3. **Add to Doppler**:
   ```bash
   SENDGRID_API_KEY=your-sendgrid-api-key
   SENDGRID_FROM_EMAIL=your-verified-sender@domain.com
   ```

4. **Verify sender**: Add your email in SendGrid sender authentication

### Option 2: Gmail SMTP (Free but limited)
1. **Enable 2FA** on your Gmail account
2. **Create App Password**:
   - Google Account → Security → 2-Step Verification
   - App passwords → Generate password for "Mail"

3. **Add to Doppler**:
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

## SMS Options

### Option 1: Twilio (Paid - Most Reliable)
1. **Sign up**: https://www.twilio.com/
2. **Get credentials**:
   - Account SID
   - Auth Token
   - Buy a phone number

3. **Add to Doppler**:
   ```bash
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Option 2: Free Email-to-SMS (Limited)
Use carrier email gateways (built into SMS service):
- Verizon: phone@vtext.com
- AT&T: phone@txt.att.net
- T-Mobile: phone@tmomail.net

## Testing the Setup

### 1. Start the server with Doppler:
```bash
cd backend
doppler run -- node server.js
```

### 2. Test Email OTP:
```bash
curl -X POST http://localhost:5000/api/auth/send-email-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@domain.com"}'
```

### 3. Test SMS OTP:
```bash
curl -X POST http://localhost:5000/api/auth/send-whatsapp-otp \
  -H "Content-Type: application/json" \
  -d '{"whatsappNumber": "+94771234567"}'
```

## Service Detection Logic

The system automatically detects which service to use:

1. **Email Priority**:
   - SendGrid (if `SENDGRID_API_KEY` exists)
   - SMTP/Gmail (if `EMAIL_USER` & `EMAIL_PASS` exist)
   - Console fallback (development)

2. **SMS Priority**:
   - Twilio (if credentials exist)
   - Console fallback (development)

## Console Fallback

If no external services are configured:
- ✅ OTPs will be logged to console
- ✅ Registration will still work
- ✅ Perfect for development testing

## Production Recommendations

1. **Email**: SendGrid (reliable, good free tier)
2. **SMS**: Twilio (industry standard)
3. **Monitoring**: Set up error logging
4. **Rate Limiting**: Implement to prevent abuse

## Cost Estimates

- **SendGrid**: Free (100 emails/day)
- **Gmail SMTP**: Free (but rate limited)
- **Twilio SMS**: ~$0.0075 per SMS
- **Development**: $0 (console logging)

Ready to test! 🎉

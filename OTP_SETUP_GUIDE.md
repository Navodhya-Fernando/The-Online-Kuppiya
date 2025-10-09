# OTP Configuration Guide for The Online Kuppiya

## Email OTP Configuration (Gmail)

1. **Create Gmail App Password:**
   - Go to Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Generate app password for "Mail"
   - Copy the 16-character password

2. **Add these variables to Doppler:**
   ```bash
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-char-app-password
   ```

## SMS OTP Configuration (Twilio - Optional)

1. **Create Twilio Account:**
   - Sign up at https://www.twilio.com
   - Get Account SID, Auth Token, and Phone Number

2. **Add these variables to Doppler:**
   ```bash
   TWILIO_ACCOUNT_SID=your-account-sid
   TWILIO_AUTH_TOKEN=your-auth-token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

## Alternative: Email-to-SMS (Free)

Most carriers provide email-to-SMS gateways:
- Verizon: phonenumber@vtext.com
- AT&T: phonenumber@txt.att.net
- T-Mobile: phonenumber@tmomail.net
- Sprint: phonenumber@messaging.sprintpcs.com

## Current Fallback Strategy

If no credentials are provided:
- **Email OTP**: Uses Ethereal Email (test service) with console logging
- **SMS OTP**: Falls back to console logging only

## Testing

1. **With Email Credentials**: Real emails will be sent
2. **Without Credentials**: 
   - Check console for OTP codes
   - Email preview URLs will be shown for Ethereal

## Security Notes

- OTPs expire in 10 minutes
- Session-based storage (consider Redis for production)
- Rate limiting recommended for production

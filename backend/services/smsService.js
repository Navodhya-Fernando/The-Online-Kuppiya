// backend/services/smsService.js
const twilio = require('twilio');

class SMSService {
    constructor() {
        this.provider = this.detectProvider();
        this.setupProvider();
    }

    detectProvider() {
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            return 'twilio';
        } else {
            return 'console';
        }
    }

    setupProvider() {
        switch (this.provider) {
            case 'twilio':
                this.client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                console.log('📱 SMS Service: Twilio configured');
                break;
            default:
                console.log('📱 SMS Service: Console fallback (no credentials)');
        }
    }

    async sendOTP(to, otp) {
        const message = `Your OTP for The Online Kuppiya is: ${otp}. This code will expire in 10 minutes. Do not share this with anyone.`;

        try {
            const result = await this.sendSMS(to, message);
            
            // Always log OTP for development
            console.log(`\n🔥 SMS OTP SENT 🔥`);
            console.log(`📱 To: ${to}`);
            console.log(`🔑 OTP: ${otp}`);
            console.log(`📨 Provider: ${this.provider}`);
            console.log(`==================\n`);
            
            return result;
        } catch (error) {
            console.error('Failed to send OTP SMS:', error);
            // Still log OTP for development if SMS fails
            console.log(`\n❌ SMS FAILED - OTP FALLBACK ❌`);
            console.log(`📱 To: ${to}`);
            console.log(`🔑 OTP: ${otp}`);
            console.log(`=============================\n`);
            throw error;
        }
    }

    async sendSMS(to, message) {
        switch (this.provider) {
            case 'twilio':
                return await this.sendWithTwilio(to, message);
            default:
                return await this.sendWithConsole(to, message);
        }
    }

    async sendWithTwilio(to, message) {
        // Format phone number
        const formattedNumber = to.startsWith('+') ? to : `+${to}`;
        
        const result = await this.client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedNumber
        });

        console.log(`✅ Twilio SMS sent: ${result.sid}`);
        return result;
    }

    async sendWithConsole(to, message) {
        console.log(`\n📱 SMS (Console Mode):`);
        console.log(`To: ${to}`);
        console.log(`Message: ${message}`);
        
        // Extract OTP for easy viewing
        const otpMatch = message.match(/(\d{6})/);
        if (otpMatch) {
            console.log(`🔑 OTP: ${otpMatch[1]}`);
        }
        console.log(`======================\n`);
        
        return { sid: 'console-' + Date.now() };
    }

    // Alternative: Email-to-SMS gateway (free for most carriers)
    async sendViEmailGateway(phoneNumber, message, carrier = 'verizon') {
        const gateways = {
            verizon: '@vtext.com',
            att: '@txt.att.net',
            tmobile: '@tmomail.net',
            sprint: '@messaging.sprintpcs.com'
        };

        const emailAddress = `${phoneNumber.replace(/\D/g, '')}${gateways[carrier]}`;
        
        // Use email service to send to SMS gateway
        const emailService = require('./emailService');
        return await emailService.sendEmail(emailAddress, 'OTP', message);
    }
}

module.exports = new SMSService();

// backend/services/emailService.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

class EmailService {
    constructor() {
        this.provider = this.detectProvider();
        this.setupProvider();
    }

    detectProvider() {
        if (process.env.SENDGRID_API_KEY) {
            return 'sendgrid';
        } else if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            return 'smtp';
        } else {
            return 'console';
        }
    }

    setupProvider() {
        switch (this.provider) {
            case 'sendgrid':
                sgMail.setApiKey(process.env.SENDGRID_API_KEY);
                console.log('📧 Email Service: SendGrid configured');
                break;
            case 'smtp':
                console.log('📧 Email Service: SMTP configured');
                break;
            default:
                console.log('📧 Email Service: Console fallback (no credentials)');
        }
    }

    async sendOTP(to, otp) {
        const subject = 'Your OTP - The Online Kuppiya';
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #2c3e50; margin-bottom: 10px;">The Online Kuppiya</h1>
                    <p style="color: #7f8c8d; font-size: 16px;">Your Academic Resource Hub</p>
                </div>
                
                <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <h2 style="color: #3498db; text-align: center; margin-bottom: 20px;">Email Verification</h2>
                    
                    <p style="font-size: 16px; color: #2c3e50; margin-bottom: 25px;">
                        Hello! Your OTP (One-Time Password) for email verification is:
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <div style="display: inline-block; background: #3498db; color: white; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 3px;">
                            ${otp}
                        </div>
                    </div>
                    
                    <p style="color: #e74c3c; font-weight: bold; text-align: center; margin: 20px 0;">
                        ⏰ This OTP will expire in 10 minutes
                    </p>
                    
                    <p style="color: #7f8c8d; font-size: 14px; margin-top: 25px;">
                        If you didn't request this verification, please ignore this email. For security reasons, do not share this OTP with anyone.
                    </p>
                </div>
                
                <div style="text-align: center; margin-top: 20px; color: #95a5a6; font-size: 12px;">
                    <p>© 2025 The Online Kuppiya | Advanced Diploma in Data Science - NIBM</p>
                </div>
            </div>
        `;

        try {
            const result = await this.sendEmail(to, subject, html);
            
            // Always log OTP for development
            console.log(`\n🔥 EMAIL OTP SENT 🔥`);
            console.log(`📧 To: ${to}`);
            console.log(`🔑 OTP: ${otp}`);
            console.log(`📨 Provider: ${this.provider}`);
            console.log(`=====================\n`);
            
            return result;
        } catch (error) {
            console.error('Failed to send OTP email:', error);
            // Still log OTP for development if email fails
            console.log(`\n❌ EMAIL FAILED - OTP FALLBACK ❌`);
            console.log(`📧 To: ${to}`);
            console.log(`🔑 OTP: ${otp}`);
            console.log(`================================\n`);
            throw error;
        }
    }

    async sendEmail(to, subject, html) {
        switch (this.provider) {
            case 'sendgrid':
                return await this.sendWithSendGrid(to, subject, html);
            case 'smtp':
                return await this.sendWithSMTP(to, subject, html);
            default:
                return await this.sendWithConsole(to, subject, html);
        }
    }

    async sendWithSendGrid(to, subject, html) {
        const msg = {
            to: to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@onlinekuppiya.com',
            subject: subject,
            html: html,
        };

        const result = await sgMail.send(msg);
        console.log(`✅ SendGrid email sent: ${result[0].statusCode}`);
        return result;
    }

    async sendWithSMTP(to, subject, html) {
        // Gmail configuration
        const transporter = nodemailer.createTransporter({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS // App password for Gmail
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to,
            subject: subject,
            html: html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`✅ SMTP email sent: ${result.messageId}`);
        return result;
    }

    async sendWithConsole(to, subject, html) {
        console.log(`\n📧 EMAIL (Console Mode):`);
        console.log(`To: ${to}`);
        console.log(`Subject: ${subject}`);
        
        // Extract OTP from HTML for easy viewing
        const otpMatch = html.match(/(\d{6})/);
        if (otpMatch) {
            console.log(`🔑 OTP: ${otpMatch[1]}`);
        }
        console.log(`========================\n`);
        
        return { messageId: 'console-' + Date.now() };
    }
}

module.exports = new EmailService();

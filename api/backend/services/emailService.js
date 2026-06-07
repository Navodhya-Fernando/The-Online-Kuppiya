const nodemailer = require('nodemailer');

const getMailConfig = () => ({
	host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
	port: Number(process.env.BREVO_SMTP_PORT || 587),
	secure: String(process.env.BREVO_SMTP_PORT || '587') === '465',
	auth: {
		user: process.env.BREVO_SMTP_USER,
		pass: process.env.BREVO_SMTP_PASS,
	},
});

const getFromAddress = () => {
	const fromEmail = process.env.BREVO_FROM_EMAIL || process.env.EMAIL_USER;
	const fromName = process.env.BREVO_FROM_NAME || 'The Online Kuppiya';

	if (!fromEmail) {
		return null;
	}

	return `${fromName} <${fromEmail}>`;
};

const createTransporter = () => {
	if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASS) {
		return null;
	}

	return nodemailer.createTransport(getMailConfig());
};

const sendMail = async ({ to, subject, html, text }) => {
	const transporter = createTransporter();
	const from = getFromAddress();

	if (!transporter || !from) {
		throw new Error('Brevo email configuration is incomplete');
	}

	return transporter.sendMail({
		from,
		to,
		subject,
		html,
		text,
	});
};

const buildEmailTemplate = ({ title, heading, body, ctaText, ctaUrl, footerText }) => {
	const plainText = [heading, body, ctaText ? `${ctaText}: ${ctaUrl}` : null, footerText]
		.filter(Boolean)
		.join('\n\n');

	return {
		html: `
			<div style="margin:0;padding:0;background:#0b1220;font-family:Arial,Helvetica,sans-serif;color:#e5eefc;">
				<div style="max-width:640px;margin:0 auto;padding:32px 20px;">
					<div style="background:linear-gradient(180deg,#13213d 0%,#0f172a 100%);border:1px solid rgba(148,163,184,.16);border-radius:24px;padding:32px;box-shadow:0 24px 80px rgba(15,23,42,.45);">
						<p style="margin:0 0 12px;font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:#94a3b8;">The Online Kuppiya</p>
						<h1 style="margin:0 0 16px;font-size:28px;line-height:1.2;color:#f8fbff;">${title}</h1>
						<p style="margin:0 0 24px;font-size:16px;line-height:1.7;color:#cbd5e1;">${heading}</p>
						<p style="margin:0 0 28px;font-size:15px;line-height:1.7;color:#cbd5e1;">${body}</p>
						${ctaText ? `
						<a href="${ctaUrl}" style="display:inline-block;background:#60a5fa;color:#0f172a;text-decoration:none;font-weight:700;padding:14px 20px;border-radius:14px;">${ctaText}</a>
						` : ''}
						<p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#94a3b8;">${footerText}</p>
					</div>
				</div>
			</div>
		`,
		text: plainText,
	};
};

const sendVerificationEmail = async ({ to, name, verificationUrl }) => {
	const template = buildEmailTemplate({
		title: 'Verify your email',
		heading: `Hi ${name || 'there'}, welcome to The Online Kuppiya.`,
		body: 'Confirm your email address so your account can be activated and you can use password recovery later if you need it.',
		ctaText: 'Verify email',
		ctaUrl: verificationUrl,
		footerText: 'If you did not create this account, you can safely ignore this email.',
	});

	return sendMail({
		to,
		subject: 'Verify your email for The Online Kuppiya',
		...template,
	});
};

const sendPasswordResetEmail = async ({ to, name, resetUrl }) => {
	const template = buildEmailTemplate({
		title: 'Reset your password',
		heading: `Hi ${name || 'there'}, we received a request to reset your password.`,
		body: 'Use the button below to choose a new password. The link expires shortly for your security.',
		ctaText: 'Reset password',
		ctaUrl: resetUrl,
		footerText: 'If you did not request this reset, you can ignore this email safely.',
	});

	return sendMail({
		to,
		subject: 'Reset your password for The Online Kuppiya',
		...template,
	});
};

const sendApprovalEmail = async ({ to, name, loginUrl }) => {
	const template = buildEmailTemplate({
		title: 'Your account is approved',
		heading: `Hi ${name || 'there'}, your account on The Online Kuppiya is now approved.`,
		body: 'You can sign in and start asking or answering questions right away.',
		ctaText: 'Sign in',
		ctaUrl: loginUrl,
		footerText: 'Thanks for being part of the community.',
	});

	return sendMail({
		to,
		subject: 'Your account is approved on The Online Kuppiya',
		...template,
	});
};

module.exports = {
	sendMail,
	sendVerificationEmail,
	sendPasswordResetEmail,
	sendApprovalEmail,
};

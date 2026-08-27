import nodemailer from 'nodemailer';
import { env } from '../../config/env.js';
import { logger } from '../../common/logging/logger.js';

export class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      logger.info('📧 Nodemailer SMTP transporter initialized');
    }
  }

  async sendVerificationEmail(to: string, name: string | null, token: string): Promise<void> {
    const verifyUrl = `${env.WEB_ORIGIN}/verify-email?token=${token}`;

    if (!this.transporter || env.NODE_ENV === 'test') {
      logger.info({ to, verifyUrl }, '📧 [DEV EMAIL MOCK] Email Verification Link Generated');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject: 'Verify your DevLearn account',
        html: `
          <div style="font-family: monospace, sans-serif; background-color: #0D0D0D; color: #FFFFFF; padding: 32px; border-radius: 8px;">
            <h2 style="color: #FFFFFF; margin-bottom: 16px;">DevLearn</h2>
            <p style="color: #BDBDBD; font-size: 14px;">Hello ${name || 'Learner'},</p>
            <p style="color: #BDBDBD; font-size: 14px;">Please verify your email address to secure your DevLearn learning tracking account.</p>
            <div style="margin: 24px 0;">
              <a href="${verifyUrl}" style="background-color: #FFFFFF; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 13px;">Verify Email</a>
            </div>
            <p style="color: #808080; font-size: 12px;">Or open this URL: <a href="${verifyUrl}" style="color: #BDBDBD;">${verifyUrl}</a></p>
          </div>
        `,
      });
      logger.info({ to }, '📧 Verification email sent successfully');
    } catch (err) {
      logger.error({ err, to }, '❌ Failed to send verification email');
    }
  }

  async sendPasswordResetEmail(to: string, name: string | null, token: string): Promise<void> {
    const resetUrl = `${env.WEB_ORIGIN}/reset-password?token=${token}`;

    if (!this.transporter || env.NODE_ENV === 'test') {
      logger.info({ to, resetUrl }, '📧 [DEV EMAIL MOCK] Password Reset Link Generated');
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.SMTP_FROM,
        to,
        subject: 'Reset your DevLearn password',
        html: `
          <div style="font-family: monospace, sans-serif; background-color: #0D0D0D; color: #FFFFFF; padding: 32px; border-radius: 8px;">
            <h2 style="color: #FFFFFF; margin-bottom: 16px;">DevLearn Password Reset</h2>
            <p style="color: #BDBDBD; font-size: 14px;">Hello ${name || 'Learner'},</p>
            <p style="color: #BDBDBD; font-size: 14px;">We received a request to reset your password. Click below to choose a new password (valid for 1 hour):</p>
            <div style="margin: 24px 0;">
              <a href="${resetUrl}" style="background-color: #FFFFFF; color: #000000; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; font-size: 13px;">Reset Password</a>
            </div>
            <p style="color: #808080; font-size: 12px;">If you did not request this, please ignore this email.</p>
          </div>
        `,
      });
      logger.info({ to }, '📧 Password reset email sent successfully');
    } catch (err) {
      logger.error({ err, to }, '❌ Failed to send password reset email');
    }
  }
}

export const emailService = new EmailService();

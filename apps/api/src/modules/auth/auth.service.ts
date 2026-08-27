import { prisma } from '../../database/prisma.js';
import type { Prisma } from '@prisma/client';
import { AppError } from '../../common/errors/app-error.js';
import {
  hashPassword,
  verifyPassword,
  generateRandomToken,
  hashToken,
} from './auth.utils.js';
import { emailService } from '../email/email.service.js';
import type { RegisterInput, LoginInput } from './auth.types.js';
import type { UserDto, UserSettingsDto } from '@devlearn/types';

const SESSION_EXPIRATION_DAYS = 30;
const VERIFICATION_TOKEN_EXPIRATION_HOURS = 24;
const RESET_TOKEN_EXPIRATION_HOURS = 1;

export class AuthService {
  /**
   * Helper to format User model to UserDto
   */
  private formatUser(user: {
    id: string;
    email: string;
    name: string | null;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  /**
   * Register a new user and create an initial session
   */
  async register(
    input: RegisterInput,
    meta: { userAgent?: string; ipAddress?: string }
  ): Promise<{ user: UserDto; sessionToken: string; settings: UserSettingsDto }> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError(409, 'An account with this email already exists', 'EMAIL_ALREADY_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);
    const rawSessionToken = generateRandomToken(32);
    const sessionTokenHash = hashToken(rawSessionToken);
    const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    const rawVerificationToken = generateRandomToken(32);
    const verificationExpiresAt = new Date(
      Date.now() + VERIFICATION_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000
    );

    // Create user, default settings, initial verification token, and session in a transaction
    const { user, settings } = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          passwordHash,
          name: input.name ?? null,
          isEmailVerified: false,
        },
      });

      const userSettings = await tx.userSettings.create({
        data: {
          userId: newUser.id,
          timezone: 'UTC',
          dailyGoalMinutes: 60,
          theme: 'dark',
        },
      });

      await tx.verificationToken.create({
        data: {
          userId: newUser.id,
          token: rawVerificationToken,
          expiresAt: verificationExpiresAt,
        },
      });

      await tx.userSession.create({
        data: {
          userId: newUser.id,
          sessionTokenHash,
          expiresAt: sessionExpiresAt,
          userAgent: meta.userAgent,
          ipAddress: meta.ipAddress,
        },
      });

      return { user: newUser, settings: userSettings };
    });

    // Send verification email
    await emailService.sendVerificationEmail(user.email, user.name, rawVerificationToken);

    return {
      user: this.formatUser(user),
      sessionToken: rawSessionToken,
      settings: {
        timezone: settings.timezone,
        dailyGoalMinutes: settings.dailyGoalMinutes,
        theme: settings.theme,
      },
    };
  }

  /**
   * Log in user and issue a new session token
   */
  async login(
    input: LoginInput,
    meta: { userAgent?: string; ipAddress?: string }
  ): Promise<{ user: UserDto; sessionToken: string; settings: UserSettingsDto | null }> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
      include: { settings: true },
    });

    if (!user) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await verifyPassword(user.passwordHash, input.password);
    if (!isValidPassword) {
      throw new AppError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
    }

    const rawSessionToken = generateRandomToken(32);
    const sessionTokenHash = hashToken(rawSessionToken);
    const sessionExpiresAt = new Date(Date.now() + SESSION_EXPIRATION_DAYS * 24 * 60 * 60 * 1000);

    await prisma.userSession.create({
      data: {
        userId: user.id,
        sessionTokenHash,
        expiresAt: sessionExpiresAt,
        userAgent: meta.userAgent,
        ipAddress: meta.ipAddress,
      },
    });

    return {
      user: this.formatUser(user),
      sessionToken: rawSessionToken,
      settings: user.settings
        ? {
            timezone: user.settings.timezone,
            dailyGoalMinutes: user.settings.dailyGoalMinutes,
            theme: user.settings.theme,
          }
        : null,
    };
  }

  /**
   * Invalidate a session (Logout)
   */
  async logout(rawSessionToken: string): Promise<void> {
    const sessionTokenHash = hashToken(rawSessionToken);
    await prisma.userSession.deleteMany({
      where: { sessionTokenHash },
    });
  }

  /**
   * Validate session token and return user
   */
  async validateSession(rawSessionToken: string): Promise<{
    user: UserDto;
    settings: UserSettingsDto | null;
    sessionId: string;
  } | null> {
    const sessionTokenHash = hashToken(rawSessionToken);

    const session = await prisma.userSession.findUnique({
      where: { sessionTokenHash },
      include: {
        user: {
          include: { settings: true },
        },
      },
    });

    if (!session) {
      return null;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await prisma.userSession.delete({ where: { id: session.id } });
      return null;
    }

    return {
      user: this.formatUser(session.user),
      settings: session.user.settings
        ? {
            timezone: session.user.settings.timezone,
            dailyGoalMinutes: session.user.settings.dailyGoalMinutes,
            theme: session.user.settings.theme,
          }
        : null,
      sessionId: session.id,
    };
  }

  /**
   * Verify email address with token
   */
  async verifyEmail(token: string): Promise<UserDto> {
    const record = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record) {
      throw new AppError(400, 'Invalid or expired verification token', 'INVALID_TOKEN');
    }

    if (new Date() > record.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: record.id } });
      throw new AppError(400, 'Verification token has expired', 'TOKEN_EXPIRED');
    }

    const updatedUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.update({
        where: { id: record.userId },
        data: { isEmailVerified: true },
      });

      await tx.verificationToken.deleteMany({
        where: { userId: record.userId },
      });

      return user;
    });

    return this.formatUser(updatedUser);
  }

  /**
   * Request password reset token
   */
  async requestPasswordReset(email: string): Promise<{ message: string; debugToken?: string }> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent email enumeration, return success message even if email not found
    if (!user) {
      return { message: 'If an account exists with this email, a reset link has been sent' };
    }

    const rawToken = generateRandomToken(32);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRATION_HOURS * 60 * 60 * 1000);

    // Remove any previous reset tokens for this user and create a fresh one
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token: rawToken,
          expiresAt,
        },
      }),
    ]);

    // Send password reset email
    await emailService.sendPasswordResetEmail(user.email, user.name, rawToken);

    return {
      message: 'If an account exists with this email, a reset link has been sent',
      debugToken: process.env.NODE_ENV === 'development' ? rawToken : undefined,
    };
  }

  /**
   * Reset password with valid token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      throw new AppError(400, 'Invalid or expired password reset token', 'INVALID_TOKEN');
    }

    if (new Date() > record.expiresAt) {
      await prisma.passwordResetToken.delete({ where: { id: record.id } });
      throw new AppError(400, 'Password reset token has expired', 'TOKEN_EXPIRED');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      // Invalidate all existing sessions on password change
      prisma.userSession.deleteMany({
        where: { userId: record.userId },
      }),
      prisma.passwordResetToken.deleteMany({
        where: { userId: record.userId },
      }),
    ]);
  }
}

export const authService = new AuthService();

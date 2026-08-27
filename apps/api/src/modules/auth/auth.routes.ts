import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { authLimiter } from '../../middleware/rate-limit.middleware.js';

export const authRouter = Router();

// Public auth endpoints with rate limiting
authRouter.post('/register', authLimiter, (req, res, next) => authController.register(req, res, next));
authRouter.post('/login', authLimiter, (req, res, next) => authController.login(req, res, next));
authRouter.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
authRouter.post('/forgot-password', authLimiter, (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Protected auth endpoints
authRouter.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next));
authRouter.get('/me', requireAuth, (req, res) => authController.getMe(req, res));

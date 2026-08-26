import { Router } from 'express';
import { authController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.js';

export const authRouter = Router();

// Public auth endpoints
authRouter.post('/register', (req, res, next) => authController.register(req, res, next));
authRouter.post('/login', (req, res, next) => authController.login(req, res, next));
authRouter.post('/verify-email', (req, res, next) => authController.verifyEmail(req, res, next));
authRouter.post('/forgot-password', (req, res, next) => authController.forgotPassword(req, res, next));
authRouter.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

// Protected auth endpoints
authRouter.post('/logout', requireAuth, (req, res, next) => authController.logout(req, res, next));
authRouter.get('/me', requireAuth, (req, res) => authController.getMe(req, res));

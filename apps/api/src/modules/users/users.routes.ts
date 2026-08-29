import { Router } from 'express';
import { usersController } from './users.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateBody } from '../../common/validation/validate.js';
import { updateUserSchema } from './users.types.js';

export const usersRouter = Router();

// All users routes require authentication
usersRouter.use(requireAuth);

usersRouter.get('/me', usersController.getMe.bind(usersController));
usersRouter.patch('/me', validateBody(updateUserSchema), usersController.updateMe.bind(usersController));
usersRouter.delete('/me', usersController.deleteMe.bind(usersController));

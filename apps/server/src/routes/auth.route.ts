import { Router } from 'express';
import { login, logout, getMe } from '../controllers/auth.controller.js';
import { authMiddleware } from '../utils/auth-middleware.js';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, getMe);

export default router;

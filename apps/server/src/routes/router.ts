import { Router } from 'express';
import userRouter from './user.route.js';
import messageRouter from './message.route.js';

const router = Router();

router.use('/users', userRouter);
router.use('/messages', messageRouter);

export default router;

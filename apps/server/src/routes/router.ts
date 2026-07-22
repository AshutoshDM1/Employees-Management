import { Router } from 'express';
import userRouter from './user.route.js';
import authRouter from './auth.route.js';
import employeeRouter from './employee.route.js';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', userRouter);
router.use('/', employeeRouter);

export default router;

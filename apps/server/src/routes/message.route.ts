import { Router } from 'express';
import { getMessages, sendMessage } from '../controllers/message.controller.js';

const router = Router();

router.get('/', getMessages);
router.post('/', sendMessage);

export default router;

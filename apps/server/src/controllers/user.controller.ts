import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../utils/db.js';
import { user } from '../db/auth-schema.js';

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await db.select().from(user);
  res.status(200).json(users);
});

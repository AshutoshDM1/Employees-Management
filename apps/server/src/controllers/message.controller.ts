import type { Request, Response } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import db from '../utils/db.js';
import { message } from '../db/schema.js';
import { auth } from '../lib/auth.js';
import { or, and, eq } from 'drizzle-orm';
import crypto from 'crypto';

// Fetch message history between logged-in user and target user
export const getMessages = asyncHandler(async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const targetUserId = req.query.userId as string;
  if (!targetUserId) {
    res.status(400).json({ error: 'Missing target userId parameter' });
    return;
  }

  // Update target user's messages to 'read' if they are for the current user
  await db
    .update(message)
    .set({ status: 'read' })
    .where(and(eq(message.senderId, targetUserId), eq(message.receiverId, session.user.id)));

  // Notify sender that reader (session.user.id) has read all their messages
  const io = req.app.get('io');
  const userSockets = req.app.get('userSockets');
  if (io && userSockets) {
    const senderSocketId = userSockets.get(targetUserId);
    if (senderSocketId) {
      io.to(senderSocketId).emit('all_messages_read', { readerId: session.user.id });
    }
  }

  const history = await db
    .select()
    .from(message)
    .where(
      or(
        and(eq(message.senderId, session.user.id), eq(message.receiverId, targetUserId)),
        and(eq(message.senderId, targetUserId), eq(message.receiverId, session.user.id)),
      ),
    )
    .orderBy(message.createdAt);

  res.status(200).json(history);
});

// Send a new message, save to db, and trigger real-time socket delivery if online
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    res.status(401).json({ error: 'Unauthorized session' });
    return;
  }

  const { receiverId, content } = req.body;
  if (!receiverId || !content) {
    res.status(400).json({ error: 'Missing receiverId or content' });
    return;
  }

  const io = req.app.get('io');
  const userSockets = req.app.get('userSockets');
  const isOnline = userSockets && userSockets.has(receiverId);
  const initialStatus = isOnline ? 'delivered' : 'sent';

  // Insert into Neon database
  const [newMsg] = await db
    .insert(message)
    .values({
      id: crypto.randomUUID(),
      senderId: session.user.id,
      receiverId,
      content,
      status: initialStatus,
    })
    .returning();

  // Push to Socket.io connection if recipient is connected
  if (io && isOnline) {
    const recipientSocketId = userSockets.get(receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('new_message', newMsg);
      console.log(`⚡ Real-time Socket.io message pushed to user: ${receiverId}`);
    }
  }

  res.status(201).json(newMsg);
});

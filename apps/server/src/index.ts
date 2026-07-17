import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from './routes/router.js';
import { origins } from './utils/origins.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import db from './utils/db.js';
import { message } from './db/schema.js';
import { and, eq } from 'drizzle-orm';

const app = express();
const port = process.env.PORT || 3000;

app.set('trust proxy', 1);

const corsOptions = {
  origin: origins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'X-Better-Auth-CSRF',
  ],
  exposedHeaders: ['Set-Cookie'],
};

// Enable CORS and parsing of JSON request bodies
app.use(cors(corsOptions));
app.use(express.json());

app.all('/api/auth/*splat', toNodeHandler(auth));

// Register API routes
app.use('/api/v1', router);

// Root API health and welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Vedaz Chat Backend API!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  });
});

// Setup HTTP server and Socket.io
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Map to track active userId -> socketId
const userSockets = new Map<string, string>();

io.on('connection', (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Send currently online user IDs to the newly connected client
  socket.emit('initial_online_users', Array.from(userSockets.keys()));

  socket.on('register', (userId: string) => {
    userSockets.set(userId, socket.id);
    console.log(`👤 User registered in socket registry: ${userId} -> ${socket.id}`);

    // Broadcast status change to all clients
    io.emit('user_status', { userId, online: true });
  });

  socket.on('typing', ({ senderId, receiverId, isTyping }) => {
    const recipientSocketId = userSockets.get(receiverId);
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('user_typing', { senderId, isTyping });
    }
  });

  socket.on('read_all_messages', async ({ senderId, receiverId }) => {
    try {
      await db
        .update(message)
        .set({ status: 'read' })
        .where(and(eq(message.senderId, senderId), eq(message.receiverId, receiverId)));

      const senderSocketId = userSockets.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit('all_messages_read', { readerId: receiverId });
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`👋 User unregistered: ${userId}`);

        // Broadcast status change to all clients
        io.emit('user_status', { userId, online: false });
        break;
      }
    }
  });
});

// Attach socket objects to express application context
app.set('io', io);
app.set('userSockets', userSockets);

httpServer.listen(port, () => {
  console.log(`🚀 Server (with Socket.io) is running on http://localhost:${port}`);
});

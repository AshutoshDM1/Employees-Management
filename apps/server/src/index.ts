import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import router from './routes/router.js';
import { origins } from './utils/origins.js';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';

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
app.use('/api', router);

// Root API health and welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Employee Management Backend API!',
    timestamp: new Date().toISOString(),
    status: 'healthy',
  });
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});

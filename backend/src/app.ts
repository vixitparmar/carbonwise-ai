import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { connectDB, useMongo } from './config/db';

// Route imports
import authRoutes from './routes/auth';
import activityRoutes from './routes/activity';
import goalRoutes from './routes/goal';
import gamificationRoutes from './routes/gamification';
import aiRoutes from './routes/ai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: '*', // for simplicity in development, restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request logger
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', limiter);

// Built-in body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health / Status endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: useMongo ? 'MongoDB' : 'Local File DB Fallback',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Route mountings
app.use('/api/auth', authRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/ai', aiRoutes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: `Route ${req.method} ${req.url} not found.` });
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('💥 Unhandled application error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal server error.',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Initialize database & start server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 CarbonWise AI backend running on port ${PORT}`);
    console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
  });
}

// Starts the application server
startServer();


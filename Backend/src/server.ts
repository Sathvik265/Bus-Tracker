import express, { Express, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import tripRoutes from './routes/trips';
import bookingRoutes from './routes/bookings';
import { connectDB } from './config/database';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic root + health endpoints
app.get('/', (_req: Request, res: Response) => {
  res.send('Backend API is running. See /health for JSON health check.');
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware (must be after routes)
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await connectDB(); // your connect function should use process.env.MONGODB_URI
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Closing server and DB connection...`);
      server.close(async () => {
        try {
          await mongoose.connection.close(false);
          console.log('MongoDB connection closed.');
          process.exit(0);
        } catch (closeErr) {
          console.error('Error during MongoDB disconnection', closeErr);
          process.exit(1);
        }
      });
      // Force-exit after timeout if close takes too long
      setTimeout(() => {
        console.warn('Forcing server shutdown after timeout.');
        process.exit(1);
      }, 30_000).unref();
    };

    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Export app (optional) for tests
export default app;

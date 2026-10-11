import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'node:path';
import { router } from './routes.js';
import { db } from './db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logger
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
    }
  });
  next();
});

// API Routes
app.use('/api', router);

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` CivicTwin + ProofMesh Intelligence Backend Running `);
    console.log(` Port: http://localhost:${PORT}`);
    console.log(` API:  http://localhost:${PORT}/api/dashboard/summary`);
    console.log(` Initialized with ${db.incidents.length} Canonical Incidents & ${db.claims.length} Claims`);
    console.log(`=======================================================`);
  });
}

export default app;

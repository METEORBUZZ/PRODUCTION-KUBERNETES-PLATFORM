import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { getVotesFromDB, incrementVoteInDB, resetVotesInDB, checkDatabaseHealth } from './db';
import {
  register,
  votesTotal,
  updateVoteMetrics,
  httpRequestsTotal,
  httpRequestDuration,
} from './metrics';

export const app = express();

// Security middlewares
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json({ limit: '1mb' }));

// Request metrics middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInSeconds = diff[0] + diff[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    const status = res.statusCode.toString();

    httpRequestsTotal.inc({ method: req.method, route, code: status });
    httpRequestDuration.observe({ method: req.method, route, code: status }, durationInSeconds);
  });

  next();
});

// 1. Health Probe (Liveness)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 2. Readiness Probe
app.get('/ready', async (_req: Request, res: Response) => {
  const dbHealthy = await checkDatabaseHealth();
  if (dbHealthy) {
    res.status(200).json({
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'unready',
      error: 'Database connection check failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// 3. Version Info
app.get('/version', (_req: Request, res: Response) => {
  res.status(200).json({
    version: process.env.APP_VERSION || '1.0.0',
    gitSha: process.env.GIT_SHA || 'dev-local',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// 4. Prometheus Metrics Endpoint
app.get('/metrics', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).end((err as Error).message);
  }
});

// 5. Get current votes
app.get('/api/votes', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getVotesFromDB();
    updateVoteMetrics(result.cat, result.dog);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// 6. Vote for CAT
app.post('/api/vote/cat', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incrementVoteInDB('CAT');
    votesTotal.inc({ option: 'cat' });
    updateVoteMetrics(result.cat, result.dog);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// 7. Vote for DOG
app.post('/api/vote/dog', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await incrementVoteInDB('DOG');
    votesTotal.inc({ option: 'dog' });
    updateVoteMetrics(result.cat, result.dog);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// 8. Reset votes for new 30s battle round
app.post('/api/votes/reset', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await resetVotesInDB();
    updateVoteMetrics(0, 0);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
  });
});

// Global error handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[API Error]:', err.stack || err.message);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

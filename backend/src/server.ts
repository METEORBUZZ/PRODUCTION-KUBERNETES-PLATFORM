import { app } from './app';
import { initDatabase, pool } from './db';

const PORT = parseInt(process.env.PORT || '8080', 10);

async function startServer() {
  console.log(`[BOOT] Initializing Cat vs Dog Voting API (Node.js ${process.version})...`);
  
  await initDatabase();

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[BOOT] Server listening on http://0.0.0.0:${PORT}`);
    console.log(`[BOOT] Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`[BOOT] Readiness check: http://0.0.0.0:${PORT}/ready`);
    console.log(`[BOOT] Metrics: http://0.0.0.0:${PORT}/metrics`);
    console.log(`[BOOT] Votes API: http://0.0.0.0:${PORT}/api/votes`);
  });

  // Graceful shutdown for Kubernetes SIGTERM/SIGINT
  const gracefulShutdown = async (signal: string) => {
    console.log(`[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);
    
    server.close(async () => {
      console.log('[SHUTDOWN] HTTP server closed.');
      try {
        await pool.end();
        console.log('[SHUTDOWN] Database pool closed.');
        process.exit(0);
      } catch (err) {
        console.error('[SHUTDOWN ERROR] Error closing database pool:', err);
        process.exit(1);
      }
    });

    // Timeout force kill if hanging
    setTimeout(() => {
      console.error('[SHUTDOWN] Forcing shutdown after timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[BOOT FATAL] Failed to start server:', err);
  process.exit(1);
});

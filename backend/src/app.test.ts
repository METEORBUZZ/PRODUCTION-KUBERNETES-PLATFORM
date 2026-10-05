import request from 'supertest';
import { app } from './app';
import { setUseMemoryStore } from './db';

process.env.USE_MEMORY_STORE = 'true';
process.env.NODE_ENV = 'test';
setUseMemoryStore(true);

describe('Cat vs Dog Voting API', () => {
  it('GET /health returns 200 healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
    expect(res.body.uptime).toBeDefined();
  });

  it('GET /ready returns 200 readiness status', async () => {
    const res = await request(app).get('/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
  });

  it('GET /version returns version and sha', async () => {
    const res = await request(app).get('/version');
    expect(res.status).toBe(200);
    expect(res.body.version).toBeDefined();
    expect(res.body.gitSha).toBeDefined();
  });

  it('GET /metrics returns Prometheus format text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('catdog_');
    expect(res.text).toContain('votes_total');
  });

  it('GET /api/votes returns initial vote structure', async () => {
    const res = await request(app).get('/api/votes');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('cat');
    expect(res.body).toHaveProperty('dog');
    expect(res.body).toHaveProperty('total');
    expect(res.body).toHaveProperty('catPercentage');
    expect(res.body).toHaveProperty('dogPercentage');
  });

  it('POST /api/vote/cat increments cat vote count', async () => {
    const initialRes = await request(app).get('/api/votes');
    const initialCat = initialRes.body.cat;

    const voteRes = await request(app).post('/api/vote/cat');
    expect(voteRes.status).toBe(200);
    expect(voteRes.body.cat).toBe(initialCat + 1);
  });

  it('POST /api/vote/dog increments dog vote count', async () => {
    const initialRes = await request(app).get('/api/votes');
    const initialDog = initialRes.body.dog;

    const voteRes = await request(app).post('/api/vote/dog');
    expect(voteRes.status).toBe(200);
    expect(voteRes.body.dog).toBe(initialDog + 1);
  });

  it('Handles concurrent votes safely', async () => {
    const initialRes = await request(app).get('/api/votes');
    const startTotal = initialRes.body.total;

    // Send 10 concurrent votes (5 cat, 5 dog)
    const promises = [
      request(app).post('/api/vote/cat'),
      request(app).post('/api/vote/dog'),
      request(app).post('/api/vote/cat'),
      request(app).post('/api/vote/dog'),
      request(app).post('/api/vote/cat'),
      request(app).post('/api/vote/dog'),
      request(app).post('/api/vote/cat'),
      request(app).post('/api/vote/dog'),
      request(app).post('/api/vote/cat'),
      request(app).post('/api/vote/dog'),
    ];

    await Promise.all(promises);

    const finalRes = await request(app).get('/api/votes');
    expect(finalRes.body.total).toBe(startTotal + 10);
  });
});

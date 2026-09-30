/**
 * Deals route smoke tests using supertest.
 * These run against the Express app in-process (no DB needed for health check).
 */
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('GET /health', () => {
  it('returns 200 with status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.timestamp).toBe('string');
  });
});

describe('GET /api/deals — without a session', () => {
  it('returns 401', async () => {
    const res = await request(app).get('/api/deals');
    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Authentication required');
  });
});

describe('POST /api/auth/google', () => {
  it('returns 400 when the credential is missing', async () => {
    const res = await request(app).post('/api/auth/google').send({});
    expect(res.status).toBe(400);
  });
});

describe('404 catch-all', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Route not found');
  });
});

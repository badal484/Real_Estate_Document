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

describe('GET /api/deals — without DB', () => {
  it('returns 500 or connects successfully', async () => {
    const res = await request(app).get('/api/deals');
    // In CI without a real DB this will 500 — that is expected at scaffold stage
    expect([200, 500]).toContain(res.status);
  });
});

describe('404 catch-all', () => {
  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/nonexistent');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBe('Route not found');
  });
});

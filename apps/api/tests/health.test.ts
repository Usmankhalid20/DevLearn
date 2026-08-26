import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

describe('System Health Endpoint', () => {
  const app = createApp();

  it('GET /health returns health response shape', async () => {
    const res = await request(app).get('/health');
    // Note: status might be 200 (if db is up) or 503 (if db is not up during unit test), but shape must be valid ApiResponse<HealthStatus>
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveProperty('status');
    expect(res.body.data).toHaveProperty('services');
  });

  it('GET /non-existent-route returns structured 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Users Module & /api/v1 API Integration Tests', () => {
  const app = createApp();
  const testEmail = `usertest_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let authCookie: string;
  let userId: string;

  beforeAll(async () => {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Original Name' });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    authCookie = regRes.headers['set-cookie'][0];
    userId = regRes.body.data.user.id;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: testEmail },
      });
    } catch {
      // Ignore cleanup error
    }
  });

  it('GET /api/v1/users/me returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/users/me returns profile and settings for authenticated user', async () => {
    const res = await request(app)
      .get('/api/v1/users/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.name).toBe('Original Name');
    expect(res.body.data.settings).toBeDefined();
  });

  it('PATCH /api/v1/users/me updates name and user settings', async () => {
    const res = await request(app)
      .patch('/api/v1/users/me')
      .set('Cookie', authCookie)
      .send({
        name: 'Updated Name',
        dailyGoalMinutes: 90,
        theme: 'monochrome',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Updated Name');
    expect(res.body.data.settings.dailyGoalMinutes).toBe(90);
    expect(res.body.data.settings.theme).toBe('monochrome');
  });

  it('DELETE /api/v1/users/me deletes the account and clears session cookie', async () => {
    const res = await request(app)
      .delete('/api/v1/users/me')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify user is deleted from DB
    const checkDb = await prisma.user.findUnique({
      where: { id: userId },
    });
    expect(checkDb).toBeNull();

    // Verify subsequent authenticated call fails
    const postDeleteRes = await request(app)
      .get('/api/v1/users/me')
      .set('Cookie', authCookie);

    expect(postDeleteRes.status).toBe(401);
  });
});

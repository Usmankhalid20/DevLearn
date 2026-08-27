import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Analytics, Contributions & Settings Integration Tests', () => {
  const app = createApp();
  const testEmail = `analytics_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let authCookie: string;
  let subjectId: string;

  beforeAll(async () => {
    // Register test user
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Analytics Tester' });
    authCookie = reg.headers['set-cookie'][0];

    // Create a subject
    const subRes = await request(app)
      .post('/api/subjects')
      .set('Cookie', authCookie)
      .send({ name: 'Algorithms & LeetCode' });
    subjectId = subRes.body.data.id;

    // Create two learning sessions (today and yesterday for streak)
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await request(app)
      .post('/api/learning-sessions')
      .set('Cookie', authCookie)
      .send({
        subjectId,
        durationMinutes: 75,
        date: today.toISOString(),
        topic: 'Dynamic Programming',
      });

    await request(app)
      .post('/api/learning-sessions')
      .set('Cookie', authCookie)
      .send({
        subjectId,
        durationMinutes: 45,
        date: yesterday.toISOString(),
        topic: 'Graph Traversal',
      });
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

  it('GET /api/contributions/calendar returns 365-day calendar with active counts', async () => {
    const res = await request(app)
      .get('/api/contributions/calendar')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.days).toHaveLength(365);
    expect(res.body.data.totalActiveDays).toBe(2);
    expect(res.body.data.totalMinutesYear).toBe(120);
  });

  it('GET /api/analytics/summary calculates streaks and subject distribution', async () => {
    const res = await request(app)
      .get('/api/analytics/summary')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalMinutes).toBe(120);
    expect(res.body.data.totalHours).toBe(2);
    expect(res.body.data.totalSessions).toBe(2);
    expect(res.body.data.currentStreak).toBe(2);
    expect(res.body.data.subjectDistribution).toHaveLength(1);
    expect(res.body.data.subjectDistribution[0].subjectName).toBe('Algorithms & LeetCode');
    expect(res.body.data.subjectDistribution[0].percentage).toBe(100);
  });

  it('GET and PUT /api/settings manages user preferences', async () => {
    const getRes = await request(app)
      .get('/api/settings')
      .set('Cookie', authCookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.dailyGoalMinutes).toBe(60);

    const updateRes = await request(app)
      .put('/api/settings')
      .set('Cookie', authCookie)
      .send({
        dailyGoalMinutes: 90,
        timezone: 'America/New_York',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.dailyGoalMinutes).toBe(90);
    expect(updateRes.body.data.timezone).toBe('America/New_York');
  });
});

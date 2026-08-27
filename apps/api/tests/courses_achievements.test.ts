import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Courses, Achievements & System Diagnostics Integration Tests', () => {
  const app = createApp();
  const testEmail = `achiever_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let authCookie: string;
  let subjectId: string;
  let courseId: string;

  beforeAll(async () => {
    // Register test user
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Achiever Tester' });
    authCookie = reg.headers['set-cookie'][0];

    // Create Subject
    const subRes = await request(app)
      .post('/api/subjects')
      .set('Cookie', authCookie)
      .send({ name: 'CS Theory' });
    subjectId = subRes.body.data.id;
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

  it('POST /api/courses creates a structured course track', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Cookie', authCookie)
      .send({
        title: 'MIT 6.824: Distributed Systems',
        platform: 'MIT OpenCourseWare',
        url: 'https://pdos.csail.mit.edu/6.824/',
        totalDurationMinutes: 600,
        subjectId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('MIT 6.824: Distributed Systems');
    expect(res.body.data.totalDurationMinutes).toBe(600);
    expect(res.body.data.progressPercentage).toBe(0);
    courseId = res.body.data.id;
  });

  it('Logging session on course updates course progress dynamically', async () => {
    // Log 150 minutes session on this course
    await request(app)
      .post('/api/learning-sessions')
      .set('Cookie', authCookie)
      .send({
        subjectId,
        courseId,
        durationMinutes: 150,
        date: new Date().toISOString(),
        topic: 'Raft Paper Walkthrough',
      });

    const res = await request(app)
      .get('/api/courses')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].completedDurationMinutes).toBe(150);
    expect(res.body.data[0].progressPercentage).toBe(25); // 150 / 600 = 25%
  });

  it('GET /api/achievements returns evaluated milestone badges', async () => {
    const res = await request(app)
      .get('/api/achievements')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(5);

    const firstSessionBadge = res.body.data.find((b: any) => b.id === 'first_session');
    expect(firstSessionBadge).toBeDefined();
    expect(firstSessionBadge.isUnlocked).toBe(true);

    const deepDiverBadge = res.body.data.find((b: any) => b.id === 'deep_diver');
    expect(deepDiverBadge).toBeDefined();
    expect(deepDiverBadge.isUnlocked).toBe(true); // 150m >= 120m
  });

  it('GET /api/system/diagnostics returns real system telemetry and service pings', async () => {
    const res = await request(app)
      .get('/api/system/diagnostics')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.services.database.status).toBe('connected');
    expect(res.body.data.memoryUsage.heapUsedMB).toBeGreaterThan(0);
  });
});

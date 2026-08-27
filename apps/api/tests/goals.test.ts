import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Goals and Export Module Integration Tests', () => {
  const app = createApp();
  const testEmail = `goals_user_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let authCookie: string;
  let subjectId: string;
  let goalId: string;

  beforeAll(async () => {
    // Register test user
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail, password: testPassword, name: 'Goals Tester' });
    authCookie = reg.headers['set-cookie'][0];

    // Create Subject
    const subRes = await request(app)
      .post('/api/subjects')
      .set('Cookie', authCookie)
      .send({ name: 'Kernel Engineering' });
    subjectId = subRes.body.data.id;

    // Log a session for Kernel Engineering (120 min = 2.0 hours)
    await request(app)
      .post('/api/learning-sessions')
      .set('Cookie', authCookie)
      .send({
        subjectId,
        durationMinutes: 120,
        date: new Date().toISOString(),
        topic: 'eBPF Probes',
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

  it('POST /api/goals creates a target goal and calculates progress from sessions', async () => {
    const res = await request(app)
      .post('/api/goals')
      .set('Cookie', authCookie)
      .send({
        title: 'Master Linux Kernel eBPF',
        targetHours: 10,
        subjectId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Master Linux Kernel eBPF');
    expect(res.body.data.targetHours).toBe(10);
    expect(res.body.data.currentHours).toBe(2);
    expect(res.body.data.progressPercentage).toBe(20);
    goalId = res.body.data.id;
  });

  it('GET /api/goals returns user goals list with progress', async () => {
    const res = await request(app)
      .get('/api/goals')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].id).toBe(goalId);
  });

  it('GET /api/export/json returns complete user data archive', async () => {
    const res = await request(app)
      .get('/api/export/json')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.body.version).toBe('1.0.0');
    expect(res.body.user.email).toBe(testEmail);
    expect(res.body.learningSessions).toHaveLength(1);
    expect(res.body.goals).toHaveLength(1);
  });

  it('GET /api/export/csv returns valid CSV format for spreadsheets', async () => {
    const res = await request(app)
      .get('/api/export/csv')
      .set('Cookie', authCookie);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('Duration (Minutes)');
    expect(res.text).toContain('Kernel Engineering');
    expect(res.text).toContain('eBPF Probes');
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Learning & Tasks Domain Integration Tests', () => {
  const app = createApp();
  const testEmail1 = `learner1_${Date.now()}@example.com`;
  const testEmail2 = `learner2_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let user1Cookie: string;
  let user2Cookie: string;
  let subjectId: string;
  let taskId: string;

  beforeAll(async () => {
    // Register User 1
    const reg1 = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail1, password: testPassword, name: 'Learner One' });
    expect(reg1.status).toBe(201);
    user1Cookie = reg1.headers['set-cookie'][0];

    // Register User 2
    const reg2 = await request(app)
      .post('/api/auth/register')
      .send({ email: testEmail2, password: testPassword, name: 'Learner Two' });
    expect(reg2.status).toBe(201);
    user2Cookie = reg2.headers['set-cookie'][0];
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          email: { in: [testEmail1, testEmail2] },
        },
      });
    } catch {
      // Ignore cleanup error
    }
  });

  it('User 1 can create a dynamic Subject', async () => {
    const res = await request(app)
      .post('/api/subjects')
      .set('Cookie', user1Cookie)
      .send({
        name: 'Distributed Systems',
        description: 'Raft, Paxos, and Consensus',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Distributed Systems');
    subjectId = res.body.data.id;
  });

  it('User 2 cannot see User 1 subjects', async () => {
    const res = await request(app)
      .get('/api/subjects')
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('User 1 can create a Task associated with the subject', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Cookie', user1Cookie)
      .send({
        title: 'Read Raft Paper Sections 1-5',
        subjectId,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.isCompleted).toBe(false);
    taskId = res.body.data.id;
  });

  it('User 1 can toggle task completion', async () => {
    const res = await request(app)
      .patch(`/api/tasks/${taskId}/toggle`)
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.isCompleted).toBe(true);
    expect(res.body.data.completedAt).toBeDefined();
  });

  it('User 1 can log a Learning Session with duration', async () => {
    const res = await request(app)
      .post('/api/learning-sessions')
      .set('Cookie', user1Cookie)
      .send({
        subjectId,
        taskId,
        durationMinutes: 45,
        date: new Date().toISOString(),
        topic: 'Leader Election',
        learnedNotes: 'Understood randomized timers to prevent split votes',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.durationMinutes).toBe(45);
    expect(res.body.data.subject.name).toBe('Distributed Systems');
    expect(res.body.data.task.id).toBe(taskId);
  });

  it('User 1 learning sessions list returns the logged session', async () => {
    const res = await request(app)
      .get('/api/learning-sessions')
      .set('Cookie', user1Cookie);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    expect(res.body.data[0].durationMinutes).toBe(45);
  });

  it('User 2 cannot see User 1 learning sessions', async () => {
    const res = await request(app)
      .get('/api/learning-sessions')
      .set('Cookie', user2Cookie);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Authentication Module Integration Tests', () => {
  const app = createApp();
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  const testName = 'Test Developer';
  let sessionCookie: string;

  afterAll(async () => {
    // Cleanup test user
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'testuser_' } },
      });
    } catch {
      // Ignore cleanup error if already deleted
    }
  });

  it('POST /api/auth/register creates a user, settings, and returns session cookie', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: testName,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(testEmail);
    expect(res.body.data.user.name).toBe(testName);
    expect(res.body.data.user.isEmailVerified).toBe(false);
    expect(res.body.data.settings).toBeDefined();
    expect(res.body.data.settings.theme).toBe('dark');

    // Verify session cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('devlearn_session');

    sessionCookie = cookies[0];
  });

  it('POST /api/auth/register rejects duplicate email with 409', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: testPassword,
        name: 'Another Name',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('POST /api/auth/login succeeds with valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: testPassword,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    sessionCookie = cookies[0];
  });

  it('POST /api/auth/login fails with invalid password (401)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: 'WrongPassword!',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('GET /api/auth/me returns profile when session cookie is provided', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe(testEmail);
  });

  it('GET /api/auth/me returns 401 when no session cookie is provided', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/auth/logout invalidates session and clears cookie', async () => {
    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', sessionCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Subsequent call to /me with old cookie should fail
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Cookie', sessionCookie);

    expect(meRes.status).toBe(401);
  });

  it('POST /api/auth/forgot-password and POST /api/auth/reset-password resets user password', async () => {
    // 1. Request reset
    const forgotRes = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email: testEmail });

    expect(forgotRes.status).toBe(200);
    expect(forgotRes.body.success).toBe(true);

    // 2. Fetch reset token from DB
    const resetRecord = await prisma.passwordResetToken.findFirst({
      where: { user: { email: testEmail } },
    });
    expect(resetRecord).toBeDefined();

    // 3. Reset password
    const newPassword = 'NewSecretPassword123!';
    const resetRes = await request(app)
      .post('/api/auth/reset-password')
      .send({
        token: resetRecord!.token,
        password: newPassword,
      });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.success).toBe(true);

    // 4. Verify login works with new password
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: testEmail,
        password: newPassword,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });

  it('POST /api/auth/verify-email successfully verifies user email address', async () => {
    // 1. Fetch verification token from DB
    const verifyRecord = await prisma.verificationToken.findFirst({
      where: { user: { email: testEmail } },
    });
    expect(verifyRecord).toBeDefined();

    // 2. Submit verification token
    const verifyRes = await request(app)
      .post('/api/auth/verify-email')
      .send({ token: verifyRecord!.token });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.success).toBe(true);
    expect(verifyRes.body.data.user.isEmailVerified).toBe(true);
  });
});

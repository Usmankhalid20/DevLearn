import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { prisma } from '../src/database/prisma.js';

describe('Admin Portal & RBAC Security Integration Tests', () => {
  const app = createApp();

  const normalEmail = `normal_${Date.now()}@example.com`;
  const adminEmail = `admin_${Date.now()}@example.com`;
  const superAdminEmail = `superadmin_${Date.now()}@example.com`;
  const targetEmail = `target_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  let normalCookie: string;
  let adminCookie: string;
  let superAdminCookie: string;
  let targetCookie: string;

  let normalUserId: string;
  let adminUserId: string;
  let superAdminUserId: string;
  let targetUserId: string;

  beforeAll(async () => {
    // 1. Create standard user
    const normalRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: normalEmail, password: testPassword, name: 'Normal User' });
    normalCookie = normalRes.headers['set-cookie'][0];
    normalUserId = normalRes.body.data.user.id;

    // 2. Create restricted admin user with only view permissions
    const adminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: adminEmail, password: testPassword, name: 'Restricted Admin' });
    adminCookie = adminRes.headers['set-cookie'][0];
    adminUserId = adminRes.body.data.user.id;

    await (prisma.user as any).update({
      where: { id: adminUserId },
      data: {
        role: 'ADMIN',
        permissions: ['view_platform_analytics', 'view_users', 'view_system_health', 'view_audit_logs'],
      },
    });

    // 3. Create Super Admin user
    const superAdminRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: superAdminEmail, password: testPassword, name: 'Super Admin' });
    superAdminCookie = superAdminRes.headers['set-cookie'][0];
    superAdminUserId = superAdminRes.body.data.user.id;

    await (prisma.user as any).update({
      where: { id: superAdminUserId },
      data: { role: 'SUPER_ADMIN' },
    });

    // 4. Create target user for moderation tests
    const targetRes = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: targetEmail, password: testPassword, name: 'Target User' });
    targetCookie = targetRes.headers['set-cookie'][0];
    targetUserId = targetRes.body.data.user.id;
  });

  afterAll(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { in: [normalEmail, adminEmail, superAdminEmail, targetEmail] } },
      });
    } catch {
      // Ignore cleanup error
    }
  });

  it('GET /api/v1/admin/overview returns 401 when not authenticated', async () => {
    const res = await request(app).get('/api/v1/admin/overview');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin/overview returns 403 when authenticated as regular USER', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Cookie', normalCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin/overview succeeds for ADMIN with view_platform_analytics permission', async () => {
    const res = await request(app)
      .get('/api/v1/admin/overview')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toBeDefined();
    expect(res.body.data.metrics.totalUsers).toBeGreaterThanOrEqual(3);
    expect(Array.isArray(res.body.data.growth.userSignupsPast30Days)).toBe(true);
    expect(Array.isArray(res.body.data.growth.studyMinutesPast30Days)).toBe(true);
  });

  it('GET /api/v1/admin/users lists users with pagination and counts', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users?limit=10&page=1')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.pagination.totalCount).toBeGreaterThanOrEqual(3);
  });

  it('GET /api/v1/admin/users filters by search term', async () => {
    const res = await request(app)
      .get(`/api/v1/admin/users?search=${encodeURIComponent(targetEmail)}`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.length).toBe(1);
    expect(res.body.data.users[0].email).toBe(targetEmail);
  });

  // Granular Permission Enforcement
  it('POST /api/v1/admin/users/:id/suspend rejects normal admin lacking suspend_users permission (403)', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/users/${targetUserId}/suspend`)
      .set('Cookie', adminCookie);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/v1/admin/users/:id/suspend succeeds for SUPER_ADMIN and sets status SUSPENDED', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/users/${targetUserId}/suspend`)
      .set('Cookie', superAdminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.status).toBe('SUSPENDED');
  });

  it('POST /api/v1/admin/users/:id/restore succeeds for SUPER_ADMIN and sets status ACTIVE', async () => {
    const res = await request(app)
      .post(`/api/v1/admin/users/${targetUserId}/restore`)
      .set('Cookie', superAdminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.status).toBe('ACTIVE');
  });

  // Super Admin Invariants
  it('POST /api/v1/admin/administrators rejects normal ADMIN (403 Super Admin required)', async () => {
    const res = await request(app)
      .post('/api/v1/admin/administrators')
      .set('Cookie', adminCookie)
      .send({
        email: `newadmin_${Date.now()}@example.com`,
        name: 'New Admin',
        permissions: ['view_users'],
      });

    expect(res.status).toBe(403);
  });

  it('POST /api/v1/admin/administrators allows SUPER_ADMIN to create an admin with permissions', async () => {
    const newAdminEmail = `created_admin_${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/v1/admin/administrators')
      .set('Cookie', superAdminCookie)
      .send({
        email: newAdminEmail,
        name: 'Created Ops Admin',
        permissions: ['view_users', 'suspend_users'],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.administrator.email).toBe(newAdminEmail);
    expect(res.body.data.administrator.permissions).toContain('suspend_users');

    // Cleanup
    await prisma.user.delete({ where: { email: newAdminEmail } });
  });

  it('POST /api/v1/admin/operations/purge-cache flushes cache and logs CACHE_PURGED audit event', async () => {
    const res = await request(app)
      .post('/api/v1/admin/operations/purge-cache')
      .set('Cookie', superAdminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const audit = await (prisma as any).auditLog.findFirst({
      where: { action: 'CACHE_PURGED' },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
  });

  it('GET /api/v1/admin/telemetry returns live system diagnostics', async () => {
    const res = await request(app)
      .get('/api/v1/admin/telemetry')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBeDefined();
    expect(res.body.data.database.status).toBe('CONNECTED');
    expect(res.body.data.system.nodeVersion).toBeDefined();
  });

  it('GET /api/v1/admin/resources returns platform learning resources catalog', async () => {
    const res = await request(app)
      .get('/api/v1/admin/resources')
      .set('Cookie', superAdminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.resources)).toBe(true);
  });

  it('GET /api/v1/admin/activity returns platform learning activity overview', async () => {
    const res = await request(app)
      .get('/api/v1/admin/activity')
      .set('Cookie', superAdminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.activities)).toBe(true);
  });

  it('GET /api/v1/admin/audit-logs returns recorded audit actions', async () => {
    const res = await request(app)
      .get('/api/v1/admin/audit-logs?limit=10')
      .set('Cookie', adminCookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.logs)).toBe(true);
    expect(res.body.data.logs.length).toBeGreaterThanOrEqual(1);
  });
});

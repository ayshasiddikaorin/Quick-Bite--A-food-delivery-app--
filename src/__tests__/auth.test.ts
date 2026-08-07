/**
 * Integration tests — Auth module
 * Covers: register, login, GET /me, PATCH /me, admin list, admin toggle
 *
 * Run:  npm test
 */
import request from 'supertest';
import { createApp } from '../app';
import { connectTestDB, clearTestDB, disconnectTestDB } from './helpers/testDb';

const app = createApp();

// ─── Seed data ────────────────────────────────────────────────────────────────
const BUYER = {
  name:     'Test Buyer',
  email:    'buyer@test.com',
  phone:    '01700000001',
  password: 'Password123',
  role:     'buyer',
};

const SELLER = {
  name:           'Test Seller',
  email:          'seller@test.com',
  phone:          '01700000002',
  password:       'Password123',
  role:           'seller',
  restaurantName: 'Test Kitchen',
};

const ADMIN = {
  name:     'Test Admin',
  email:    'admin@test.com',
  phone:    '01700000003',
  password: 'AdminPass99',
  role:     'admin',
};

// ─── Lifecycle ─────────────────────────────────────────────────────────────────
beforeAll(async () => {
  await connectTestDB();
});

afterEach(async () => {
  await clearTestDB();
});

afterAll(async () => {
  await disconnectTestDB();
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/auth/register
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/v1/auth/register', () => {
  it('registers a buyer and returns full auth payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(BUYER)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Registration successful');

    const d = res.body.data;
    expect(d.usertoken).toBeTruthy();
    expect(d.userId).toBeTruthy();
    expect(d.name).toBe(BUYER.name);
    expect(d.email).toBe(BUYER.email);
    expect(d.phone).toBe(BUYER.phone);
    expect(d.role).toBe('buyer');
    expect(d.isPremium).toBe(false);
    expect(d.loyaltyPoints).toBe(0);
    expect(d.walletBalance).toBe(0);
    expect(d.totalOrders).toBe(0);
    expect(d.memberSince).toBeTruthy();
    // password must NOT be returned
    expect(d.password).toBeUndefined();
  });

  it('registers a seller with restaurantName', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(SELLER)
      .expect(201);

    expect(res.body.data.role).toBe('seller');
    expect(res.body.data.restaurantName).toBe(SELLER.restaurantName);
  });

  it('returns 409 when email already exists', async () => {
    await request(app).post('/api/v1/auth/register').send(BUYER);
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send(BUYER)
      .expect(409);

    expect(res.body.success).toBe(false);
  });

  it('returns 422 when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'nope@test.com', password: '123456' })
      .expect(422);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/name/i);
  });

  it('returns 422 when password is too short', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...BUYER, password: '123' })
      .expect(422);

    expect(res.body.success).toBe(false);
  });

  it('returns 422 for invalid role', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ...BUYER, role: 'superuser' })
      .expect(422);

    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// POST /api/v1/auth/login
// ═══════════════════════════════════════════════════════════════════════════════
describe('POST /api/v1/auth/login', () => {
  beforeEach(async () => {
    // Seed a buyer account before each login test
    await request(app).post('/api/v1/auth/register').send(BUYER);
  });

  it('logs in with correct credentials and returns full payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: BUYER.email, password: BUYER.password })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Login successful');

    const d = res.body.data;
    expect(d.usertoken).toBeTruthy();
    expect(d.userId).toBeTruthy();
    expect(d.name).toBe(BUYER.name);
    expect(d.email).toBe(BUYER.email);
    expect(d.role).toBe('buyer');
    expect(d.password).toBeUndefined();
  });

  it('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: BUYER.email, password: 'wrongpassword' })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('returns 401 for unknown email', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'ghost@test.com', password: BUYER.password })
      .expect(401);

    expect(res.body.success).toBe(false);
  });

  it('returns 403 when correct credentials but wrong role hint provided', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: BUYER.email, password: BUYER.password, role: 'seller' })
      .expect(403);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/buyer/i);
  });

  it('returns 422 when email field is missing', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ password: BUYER.password })
      .expect(422);

    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// GET /api/v1/auth/me
// ═══════════════════════════════════════════════════════════════════════════════
describe('GET /api/v1/auth/me', () => {
  let token: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/v1/auth/register').send(BUYER);
    token = reg.body.data.usertoken;
  });

  it('returns the authenticated user profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    const d = res.body.data;
    expect(d.email).toBe(BUYER.email);
    expect(d.name).toBe(BUYER.name);
    expect(d.role).toBe('buyer');
    expect(d.password).toBeUndefined();
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/v1/auth/me').expect(401);
    expect(res.body.success).toBe(false);
  });

  it('returns 401 with a malformed token', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer not.a.real.token')
      .expect(401);

    expect(res.body.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// PATCH /api/v1/auth/me  (update profile)
// ═══════════════════════════════════════════════════════════════════════════════
describe('PATCH /api/v1/auth/me', () => {
  let token: string;

  beforeEach(async () => {
    const reg = await request(app).post('/api/v1/auth/register').send(BUYER);
    token = reg.body.data.usertoken;
  });

  it('updates name and phone', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', phone: '01999999999' })
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Updated Name');
    expect(res.body.data.phone).toBe('01999999999');
  });

  it('does NOT allow role escalation via profile update', async () => {
    const res = await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'admin' })
      .expect(200);

    // Role must remain buyer
    expect(res.body.data.role).toBe('buyer');
  });

  it('does NOT allow password change via this endpoint', async () => {
    await request(app)
      .patch('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ password: 'hackedpassword' })
      .expect(200);

    // Old password should still work
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: BUYER.email, password: BUYER.password })
      .expect(200);

    expect(loginRes.body.success).toBe(true);
  });

  it('returns 401 without auth token', async () => {
    await request(app)
      .patch('/api/v1/auth/me')
      .send({ name: 'Hacker' })
      .expect(401);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// Admin: GET /api/v1/auth/admin/users
// ═══════════════════════════════════════════════════════════════════════════════
describe('Admin routes', () => {
  let adminToken: string;
  let buyerToken: string;
  let buyerUserId: string;

  beforeEach(async () => {
    // Create admin via the service so password is hashed exactly once
    const { UserService } = await import('../modules/users/user.service');
    const { UserRepository } = await import('../modules/users/user.repository');
    const svc = new UserService(new UserRepository());
    await svc.register({ ...ADMIN, role: 'admin' as const });

    const adminLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: ADMIN.email, password: ADMIN.password });
    adminToken = adminLogin.body.data.usertoken;

    const buyerReg = await request(app)
      .post('/api/v1/auth/register')
      .send(BUYER);
    buyerToken = buyerReg.body.data.usertoken;
    buyerUserId = buyerReg.body.data.userId;
  });

  it('admin can list all users', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2); // admin + buyer
  });

  it('admin can filter users by role', async () => {
    const res = await request(app)
      .get('/api/v1/auth/admin/users?role=buyer')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res.body.data.every((u: any) => u.role === 'buyer')).toBe(true);
  });

  it('non-admin gets 403 on admin endpoints', async () => {
    await request(app)
      .get('/api/v1/auth/admin/users')
      .set('Authorization', `Bearer ${buyerToken}`)
      .expect(403);
  });

  it('admin can toggle a user active/inactive', async () => {
    // Toggle off
    const res1 = await request(app)
      .patch(`/api/v1/auth/admin/users/${buyerUserId}/toggle`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res1.body.data.isActive).toBe(false);

    // Toggle back on
    const res2 = await request(app)
      .patch(`/api/v1/auth/admin/users/${buyerUserId}/toggle`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(res2.body.data.isActive).toBe(true);
  });

  it('deactivated user cannot log in', async () => {
    // Toggle buyer off via admin
    await request(app)
      .patch(`/api/v1/auth/admin/users/${buyerUserId}/toggle`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Login attempt should fail
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: BUYER.email, password: BUYER.password })
      .expect(403);

    expect(res.body.message).toMatch(/deactivated/i);
  });

  it('unauthenticated user gets 401 on admin endpoints', async () => {
    await request(app).get('/api/v1/auth/admin/users').expect(401);
  });
});

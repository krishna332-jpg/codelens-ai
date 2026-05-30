const request = require('supertest');
const app = require('../server');

describe('Health Check', () => {
  test('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.timestamp).toBeDefined();
  });
});

describe('Auth Routes', () => {
  test('POST /api/auth/register - missing fields returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/auth/login - missing credentials returns 400', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBeDefined();
  });

  test('POST /api/auth/login - wrong credentials returns 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'fake@fake.com', password: 'wrongpass' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Review Route', () => {
  test('POST /api/review - no code returns 400', async () => {
    const res = await request(app)
      .post('/api/review')
      .send({ language: 'javascript' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/code/i);
  });

  test('POST /api/review - code too long returns 400', async () => {
    const res = await request(app)
      .post('/api/review')
      .send({ code: 'x'.repeat(20001), language: 'javascript' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/too long/i);
  });

  test('POST /api/review - unsupported language returns 400', async () => {
    const res = await request(app)
      .post('/api/review')
      .send({ code: 'print("hello")', language: 'brainfuck' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toMatch(/unsupported/i);
  });
});

describe('History Route - Unauthenticated', () => {
  test('GET /api/history - no token returns 401', async () => {
    const res = await request(app).get('/api/history');
    expect(res.statusCode).toBe(401);
  });

  test('DELETE /api/history/someid - no token returns 401', async () => {
    const res = await request(app).delete('/api/history/someid');
    expect(res.statusCode).toBe(401);
  });
});

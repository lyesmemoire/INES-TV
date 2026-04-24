import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';
import { prisma } from '../../server/services/db.js';
import bcrypt from 'bcryptjs';

describe('Backend: Auth API', () => {
  it('should return 401 for invalid credentials', async () => {
    // Mock user not found
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

    const app = await createApp();
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'wrong@test.com', password: 'wrong' });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe('Identifiants invalides');
  });

  it('should return 200 with token for valid credentials', async () => {
    // Mock user found and password match
    const mockUser = { id: '123', email: 'test@test.com', passwordHash: 'hashed', role: 'user', name: 'Test' };
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser as any);
    vi.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true as any);

    const app = await createApp();
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@test.com', password: 'password123' });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
    expect(response.body.user.id).toBe('123');
  });
});


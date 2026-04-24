import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { createApp } from '../../server';
import { prisma } from '../../server/services/db.js';

describe('Backend: Health API', () => {
  it('should return 200 and UP status when DB is connected', async () => {
    // Mock Prisma query success
    vi.spyOn(prisma, '$queryRaw').mockResolvedValueOnce([1]);
    
    const app = await createApp();
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('OK');
    expect(response.body.services.database).toBe('UP');
  });

  it('should return 503 when DB is down', async () => {
    // Mock Prisma query failure
    vi.spyOn(prisma, '$queryRaw').mockRejectedValueOnce(new Error('Connection failed'));
    
    const app = await createApp();
    const response = await request(app).get('/api/health');
    
    expect(response.status).toBe(503);
    expect(response.body.services.database).toBe('DOWN');
  });
});

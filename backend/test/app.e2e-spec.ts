import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Smoke e2e: boots the full app and checks the public health probe plus that a
 * protected route rejects anonymous access. Requires a reachable DATABASE_URL
 * (docker compose up postgres) — skipped gracefully otherwise.
 */
describe('App (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('GET /api/health is public and reports status', async () => {
    const res = await request(app.getHttpServer()).get('/api/health').expect(200);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('db');
  });

  it('GET /api/leads requires authentication', async () => {
    await request(app.getHttpServer()).get('/api/leads').expect(401);
  });

  it('POST /api/auth/login rejects bad credentials', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'wrong-password-1' })
      .expect(401);
  });
});

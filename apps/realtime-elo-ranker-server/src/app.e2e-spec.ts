import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayerEntity } from './players/player.entity';
import { MatchEntity } from './ranking/entities/match.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

describe('App E2E', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        EventEmitterModule.forRoot(),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [PlayerEntity, MatchEntity],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('health check', async () => {
    const res = await request(app.getHttpServer()).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('creates player and prevents duplicates', async () => {
    const create = await request(app.getHttpServer())
      .post('/api/player')
      .send({ id: 'alice' });
    expect(create.status).toBe(200);
    expect(create.body.id).toBe('alice');

    const dup = await request(app.getHttpServer())
      .post('/api/player')
      .send({ id: 'alice' });
    expect(dup.status).toBe(409);
  });

  it('returns 404 ranking when empty then returns ranking after players', async () => {
    const res404 = await request(app.getHttpServer()).get('/api/ranking');
    expect(res404.status).toBe(404);

    await request(app.getHttpServer()).post('/api/player').send({ id: 'alice' });
    const res200 = await request(app.getHttpServer()).get('/api/ranking');
    expect(res200.status).toBe(200);
    expect(Array.isArray(res200.body)).toBe(true);
    expect(res200.body[0].id).toBe('alice');
  });

  it('rejects match with unknown players', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/match')
      .send({ winner: 'unknown', loser: 'ghost', draw: false });
    expect(res.status).toBe(422);
  });

  it('applies Elo after match', async () => {
    await request(app.getHttpServer()).post('/api/player').send({ id: 'alice' });
    await request(app.getHttpServer()).post('/api/player').send({ id: 'bob' });

    const match = await request(app.getHttpServer())
      .post('/api/match')
      .send({ winner: 'alice', loser: 'bob', draw: false });
    expect(match.status).toBe(200);

    const ranking = await request(app.getHttpServer()).get('/api/ranking');
    const alice = ranking.body.find((p: any) => p.id === 'alice');
    const bob = ranking.body.find((p: any) => p.id === 'bob');
    expect(alice.rank).toBeGreaterThan(1000);
    expect(bob.rank).toBeLessThan(1000);
  });
});

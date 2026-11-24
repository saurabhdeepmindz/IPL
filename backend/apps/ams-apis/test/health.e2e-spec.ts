/**
 * @file    health.e2e-spec.ts
 * @module  AmsApisModule
 *
 * @description
 * End-to-end test of the health route. In plain words: starts the application and calls /api/v1/health with no token.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-01
 */

import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AmsApisModule } from '@app/ams-apis/module';

describe('Health route (ST-ADM01-000-BE-01)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AmsApisModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  /**
   * @subtask ST-ADM01-000-BE-01
   * In plain words: the API answers "ok" without any token.
   */
  it('answers 200 with status ok and no token', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.time).toBe('string');
  });

  /**
   * @subtask ST-ADM01-000-BE-04
   * In plain words: an unknown address answers 404 in the standard failure body, so the global filter is registered.
   */
  it('answers an unknown route with the standard failure body', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/nothing-here').expect(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.error.fields).toEqual([]);
  });
});

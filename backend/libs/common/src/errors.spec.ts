/**
 * @file    errors.spec.ts
 * @module  CommonModule
 *
 * @description
 * Supporting tests of ST-ADM01-000-BE-04, written before the code. In plain words: every kind of failure reaches the caller in the same body with the right status, and all invalid fields come back together.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

import { Body, Controller, ForbiddenException, Get, INestApplication, Post, Query } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IsEmail, IsString, MinLength } from 'class-validator';
import request from 'supertest';
import { AllFieldsValidationPipe } from './pipes/validation.pipe';
import { GlobalExceptionFilter } from './filters/global-exception.filter';
import { NotFoundAppException } from './errors/not-found.exception';
import { listResponse, okResponse } from './response/api-response';
import { parsePaging } from './pagination/paging';

class SampleDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(3) fullName!: string;
}

@Controller('probe')
class ProbeController {
  @Get('forbidden') forbidden(): void {
    throw new ForbiddenException({ code: 'FORBIDDEN', message: 'You do not have this right' });
  }
  @Get('missing') missing(): void {
    throw new NotFoundAppException('USER_NOT_FOUND', 'No such user');
  }
  @Get('boom') boom(): void {
    throw new Error('secret stack detail');
  }
  @Post('check') check(@Body() dto: SampleDto): unknown {
    return okResponse({ got: dto.email });
  }
  @Get('list') list(@Query('page') page?: string, @Query('pageSize') pageSize?: string): unknown {
    const p = parsePaging({ page, pageSize });
    return listResponse([{ n: 1 }], { ...p, total: 51 });
  }
}

describe('ST-ADM01-000-BE-04 errors, validation and paging', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ controllers: [ProbeController] }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalPipes(new AllFieldsValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('a ForbiddenException with code FORBIDDEN gives 403 and the failure body', async () => {
    const res = await request(app.getHttpServer()).get('/probe/forbidden').expect(403);
    expect(res.body.error).toMatchObject({ code: 'FORBIDDEN', message: 'You do not have this right' });
    expect(res.body.error.fields).toEqual([]);
  });

  it('a typed not-found exception gives 404 with its own code', async () => {
    const res = await request(app.getHttpServer()).get('/probe/missing').expect(404);
    expect(res.body.error.code).toBe('USER_NOT_FOUND');
  });

  it('two invalid fields give one 422 with two entries', async () => {
    const res = await request(app.getHttpServer()).post('/probe/check').send({ email: 'nope', fullName: 'x' }).expect(422);
    expect(res.body.error.code).toBe('VALIDATION_FAILED');
    expect(res.body.error.fields.map((f: { field: string }) => f.field).sort()).toEqual(['email', 'fullName']);
  });

  it('a valid body passes and is wrapped in data', async () => {
    const res = await request(app.getHttpServer()).post('/probe/check').send({ email: 'a@b.co', fullName: 'Asha' }).expect(201);
    expect(res.body.data.got).toBe('a@b.co');
  });

  it('an unknown error gives 500 INTERNAL_ERROR with no stack or detail in the body', async () => {
    const res = await request(app.getHttpServer()).get('/probe/boom').expect(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(res.body)).not.toContain('secret stack detail');
  });

  it('a paged list carries page, pageSize and total, with defaults 1 and 25', async () => {
    const res = await request(app.getHttpServer()).get('/probe/list').expect(200);
    expect(res.body.meta).toEqual({ page: 1, pageSize: 25, total: 51 });
  });

  it('pageSize above 100 is held at 100 and a bad page becomes 1', () => {
    expect(parsePaging({ page: '0', pageSize: '500' })).toEqual({ page: 1, pageSize: 100 });
  });
});

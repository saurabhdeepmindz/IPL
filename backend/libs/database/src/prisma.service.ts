/**
 * @file    prisma.service.ts
 * @module  DatabaseModule
 *
 * @description
 * The one place that owns the database connection. In plain words: it connects when the application starts, disconnects when it stops, and hands out two clients.
 * `db` is filtered by the session company (use it in repositories); `raw` is not (seeds and the audit service only).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-02
 */

import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { readEnv } from '@config';
import { PrismaClient } from './generated/client';
import { companyFilterExtension } from './extensions/company-filter.extension';

/**
 * Database service.
 *
 * In plain words: inject this in a repository (`database.ts`) and use `this.prisma.db`. No other file imports Prisma.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   every back-end story
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  /** Client without the company filter. Seeds and the audit service only. */
  readonly raw: PrismaClient;
  /** Client filtered by the session company. */
  readonly db: ReturnType<PrismaClient['$extends']> & PrismaClient;

  constructor() {
    const adapter = new PrismaPg({ connectionString: readEnv('DATABASE_URL') });
    this.raw = new PrismaClient({ adapter });
    this.db = this.raw.$extends(companyFilterExtension) as unknown as PrismaService['db'];
  }

  /**
   * Connect when the application starts.
   *
   * In plain words: opens the database connection.
   *
   * @returns Nothing
   * @dependencies PrismaClient.$connect
   */
  async onModuleInit(): Promise<void> {
    await this.raw.$connect();
    this.logger.log('Database connected');
  }

  /**
   * Disconnect when the application stops.
   *
   * In plain words: closes the database connection.
   *
   * @returns Nothing
   * @dependencies PrismaClient.$disconnect
   */
  async onModuleDestroy(): Promise<void> {
    await this.raw.$disconnect();
  }
}

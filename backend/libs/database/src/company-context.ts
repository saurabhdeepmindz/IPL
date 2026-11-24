/**
 * @file    company-context.ts
 * @module  DatabaseModule
 *
 * @description
 * Holds the session company for the current request. In plain words: the guard sets the company once, and every database read and write below it is filtered by it.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-02
 */

import { AsyncLocalStorage } from 'node:async_hooks';

const storage = new AsyncLocalStorage<{ companyCode: string }>();

/**
 * Per-request company, carried through async calls.
 *
 * In plain words: `CompanyContext.run('IPL', fn)` runs `fn` with company IPL; `CompanyContext.current()` tells any code below which company that is.
 *
 * @rtm
 *   epics:     EPIC-ADM-01
 *   stories:   US-ADM01-017
 *   workflows: none
 *   frd:       none
 *   contracts: none
 *   lld:       LLD-EPIC-ADM-01 v0.5 section 6.0
 */
export class CompanyContext {
  /**
   * Run a function with a session company.
   *
   * In plain words: sets the company for everything the function does.
   *
   * @param companyCode Session company, for example IPL
   * @param fn Work to run. It must `await` its database calls inside (Prisma calls start when awaited, so a promise returned unawaited runs outside the company)
   * @returns Whatever `fn` returns
   * @dependencies AsyncLocalStorage.run
   */
  static run<T>(companyCode: string, fn: () => T): T {
    return storage.run({ companyCode }, fn);
  }

  /**
   * The company of the current request.
   *
   * In plain words: undefined for seeds and background jobs, which then see every company.
   *
   * @returns The company code, or undefined
   * @dependencies AsyncLocalStorage.getStore
   */
  static current(): string | undefined {
    return storage.getStore()?.companyCode;
  }

  /**
   * Set the company for the rest of the current request.
   *
   * In plain words: used by the sign-in guard, which cannot wrap the code that runs after it; everything the request does next sees this company.
   *
   * @param companyCode Session company, for example IPL
   * @returns Nothing
   * @dependencies AsyncLocalStorage.enterWith
   */
  static enter(companyCode: string): void {
    storage.enterWith({ companyCode });
  }
}

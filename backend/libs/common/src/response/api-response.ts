/**
 * @file    api-response.ts
 * @module  CommonModule
 *
 * @description
 * The success and failure bodies of every API (Foundation section 3.1). In plain words: success is { data, meta }, failure is { error }.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
}

export interface SuccessBody<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface FailureBody {
  error: { code: string; message: string; fields: { field: string; message: string }[]; details?: Record<string, unknown> };
}

/**
 * Wrap one result.
 *
 * In plain words: the body of a normal success.
 *
 * @param data The result
 * @param meta Optional extra information
 * @returns `{ data, meta? }`
 * @dependencies none
 */
export function okResponse<T>(data: T, meta?: Record<string, unknown>): SuccessBody<T> {
  return meta ? { data, meta } : { data };
}

/**
 * Wrap a page of a list.
 *
 * In plain words: the body of a list, with page, pageSize and total.
 *
 * @param data The rows of this page
 * @param meta Page, page size and the total number of rows
 * @returns `{ data, meta }`
 * @dependencies none
 */
export function listResponse<T>(data: T[], meta: PageMeta): SuccessBody<T[]> {
  return { data, meta: { page: meta.page, pageSize: meta.pageSize, total: meta.total } };
}

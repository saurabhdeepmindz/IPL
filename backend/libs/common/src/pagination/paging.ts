/**
 * @file    paging.ts
 * @module  CommonModule
 *
 * @description
 * Reads page and pageSize from a request. In plain words: page starts at 1, the page size is 25 unless asked, and never more than 100.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-BE-04
 */

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

/**
 * Read the paging values of a request.
 *
 * In plain words: turns the text the browser sent into safe numbers.
 *
 * @param input Raw `page` and `pageSize` values
 * @returns Page (at least 1) and page size (1 to 100)
 * @dependencies none
 */
export function parsePaging(input: { page?: string; pageSize?: string }): { page: number; pageSize: number } {
  const page = Math.max(1, Math.floor(Number(input.page)) || 1);
  const asked = Math.floor(Number(input.pageSize)) || DEFAULT_PAGE_SIZE;
  return { page, pageSize: Math.min(MAX_PAGE_SIZE, Math.max(1, asked)) };
}

/**
 * Number of rows to skip for a page.
 *
 * In plain words: the offset used in the database query.
 *
 * @param page Page, from 1
 * @param pageSize Rows per page
 * @returns Rows to skip
 * @dependencies none
 */
export function skipFor(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}

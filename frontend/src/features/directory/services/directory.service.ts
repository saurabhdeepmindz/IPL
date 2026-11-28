/**
 * @file    directory.service.ts
 * @module  DirectoryFeature
 *
 * @description
 * Directory service. In plain words: the read-only role list that other features use for their lists and drop-downs.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */
import { api } from '@/lib/api-client';
import type { RoleOption } from '../types/directory.types';

/** The roles for a filter (API-ROL-01): only the fields a list or a drop-down needs. */
export async function listRoleOptions(query: { q?: string; type?: string; status?: string }): Promise<{ items: RoleOption[] }> {
  const res = await api.get<{ data: { items: RoleOption[] } }>('/roles', { params: query });
  return { items: res.data.data.items };
}

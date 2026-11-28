/**
 * @file    useRoleOptions.ts
 * @module  DirectoryFeature
 *
 * @description
 * Role options hook. In plain words: loads the roles for the drop-downs of other features (the same query key as the roles screens).
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */
import { useQuery } from '@tanstack/react-query';
import { listRoleOptions } from '../services/directory.service';
import { directoryKeys } from './directory.keys';

/** The roles for a filter, for a list or a drop-down. */
export function useRoleOptions(filters: { q?: string; type?: string; status?: string }) {
  return useQuery({ queryKey: directoryKeys.roles(filters), queryFn: () => listRoleOptions(filters) });
}

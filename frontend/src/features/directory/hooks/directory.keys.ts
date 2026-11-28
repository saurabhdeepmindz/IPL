/**
 * @file    directory.keys.ts
 * @module  DirectoryFeature
 *
 * @description
 * Directory query keys. In plain words: the keys keep the shapes the roles and users features use, so their changes still refresh these lists.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */

export const directoryKeys = {
  /** The roles list for a filter (the same key as the roles screens, so a change of a role refreshes the lists of other screens). */
  roles: (filters: { q?: string; type?: string; status?: string }) => ['roles', 'list', filters] as const,
  masters: (name: string) => ['users', 'masters', name] as const,
};

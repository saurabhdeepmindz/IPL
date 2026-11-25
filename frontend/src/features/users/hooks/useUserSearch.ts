/**
 * @file    useUserSearch.ts
 * @module  UsersFeature
 *
 * @description
 * User search hook. In plain words: searches users while the Administrator types.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-013
 * @subtask        ST-ADM01-013-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.27 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.27.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/src/features/users/hooks/useUserSearch.ts
 * @lld-synced     v0.27
 * @status         built
 */
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { listUsers } from '../services/users.service';

/**
 * User search hook. In plain words: waits 300 ms after typing, starts at 2 characters, then calls `listUsers`.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-013
 * @subtask   ST-ADM01-013-FE-01
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @contract  API-USR-01
 * @ac        AC-US013-01
 * @lld       LLD-EPIC-ADM-01 v0.19 §6.5
 * @status    built
 *
 * @dependencies listUsers
 *
 * @returns The query result
 */
export function useUserSearch(text: string) {
  const [settled, setSettled] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => setSettled(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text]);
  return useQuery({ queryKey: ['users', 'search', settled], queryFn: () => listUsers({ q: settled, pageSize: 10 }), enabled: settled.length >= 2 });
}

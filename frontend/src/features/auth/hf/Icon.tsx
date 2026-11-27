/**
 * @file    Icon.tsx
 * @module  Auth
 *
 * @description
 * Icons of the high-fidelity design. In plain words: the same line icons the mock-up draws, as one React component.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/hf/Icon.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01
 * @status         built
 */

import type { SVGProps } from 'react';
import { hf } from './hf';

const PATHS = {
  alert: 'm10.3 3.9-8.2 14A2 2 0 0 0 3.8 21h16.4a2 2 0 0 0 1.7-3.1l-8.2-14a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01',
  alertC: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 8v4M12 16h.01',
  checkC: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 12l3 3 5-6',
  clock: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 6v6l4 2',
  chevL: 'm15 18-6-6 6-6',
  building: 'M6 2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zM9 22v-4h6v4M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01',
  copy: 'M11 9h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2zM5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1',
  key: 'M15.5 15.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11zM12 11.6 2 21.6M6 17l2.5 2.5M9 14l2.5 2.5',
  info: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01',
  mail: 'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7',
  user: 'M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  ban: 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM4.9 4.9l14.2 14.2',
  refresh: 'M21 12a9 9 0 0 1-15.5 6.2L3 16M3 21v-5h5M3 12a9 9 0 0 1 15.5-6.2L21 8M21 3v5h-5',
  sso: 'M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3',
} as const;

export type IconName = keyof typeof PATHS;

/** Icon of the high-fidelity design (24-unit grid, stroke 1.8, drawn with the colour of the text). */
export function Icon({ name, size, ...rest }: { name: IconName; size?: 'sm' | 'lg' } & SVGProps<SVGSVGElement>) {
  return (
    <svg className={hf('ic', size)} viewBox="0 0 24 24" aria-hidden="true" {...rest}>
      <path d={PATHS[name]} />
    </svg>
  );
}

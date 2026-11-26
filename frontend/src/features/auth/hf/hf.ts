/**
 * @file    hf.ts
 * @module  Auth
 *
 * @description
 * Class helper of the ported high-fidelity stylesheet. In plain words: adds the hf- prefix to every class name.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/hf/hf.ts
 * @lld-synced     v0.5
 * @hf             LGN-01
 * @status         built
 */

/** Class helper of the ported high-fidelity stylesheet: every class carries the `hf-` prefix (see check-hf-fidelity/port_hf_css.py). */
export function hf(...names: (string | false | undefined | null)[]): string {
  return names
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .map((c) => `hf-${c}`)
    .join(' ');
}

/** The id of the scope element that carries the ported tokens and rules. */
export const HF_SCOPE = 'hf-scope hf-auth-body';

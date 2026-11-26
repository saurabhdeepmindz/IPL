/**
 * @file    hf.ts
 * @module  HF
 *
 * @description
 * Class helper of the ported high-fidelity stylesheet. In plain words: adds the hf- prefix to every class name.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @lld            LLD-EPIC-ADM-01 v0.30 §6
 * @lld-file       docs/modules/ADM-A1/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.30.md
 * @hf             all
 * @status         built
 */

/** Class helper of the ported high-fidelity stylesheet: every class carries the `hf-` prefix (see the skill check-hf-fidelity, port_hf_css.py). */
export function hf(...names: (string | false | undefined | null)[]): string {
  return names
    .filter(Boolean)
    .join(' ')
    .split(/\s+/)
    .map((c) => `hf-${c}`)
    .join(' ');
}

/** Classes of the element that carries the ported tokens and rules (a page of the application, not the login frame). */
export const HF_SCOPE_PAGE = 'hf-admin';

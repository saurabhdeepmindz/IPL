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
 * @hf             all
 * @source         built outside the LLD (a helper ported from the high-fidelity design)
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

/** The element that carries the ported tokens and rules on the Login pages (the sign-in family frame). */
export const HF_SCOPE = 'hf-scope hf-auth-body';

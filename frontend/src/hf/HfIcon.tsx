/**
 * @file    HfIcon.tsx
 * @module  HF
 *
 * @description
 * Icon of the high-fidelity design. In plain words: the same line icons the mock-up draws.
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

import type { SVGProps } from 'react';
import { hf } from './hf';
import { HF_ICONS, type HfIconName } from './icons.generated';

/** An icon of the high-fidelity design: the same markup the mock-up draws (24-unit grid, stroke 1.8, colour of the text). The markup is static text from the design, never user input. */
export function HfIcon({ name, size, className, ...rest }: { name: HfIconName; size?: 'sm' | 'lg' } & SVGProps<SVGSVGElement>) {
  return <svg className={[hf('ic', size), className].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: HF_ICONS[name] ?? '' }} {...rest} />;
}

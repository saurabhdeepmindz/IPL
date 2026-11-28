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
 * @hf             all
 * @source         built outside the LLD (a helper ported from the high-fidelity design)
 * @status         built
 */

import type { SVGProps } from 'react';
import { hf } from './hf';
import { HF_ICONS, type HfIconName } from './icons.generated';

/** An icon of the high-fidelity design: the same markup the mock-up draws (24-unit grid, stroke 1.8, colour of the text). The markup is static text from the design, never user input. */
export function HfIcon({ name, size, className, ...rest }: { name: HfIconName; size?: 'sm' | 'lg' } & SVGProps<SVGSVGElement>) {
  return <svg className={[hf('ic', size), className].filter(Boolean).join(' ')} viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: HF_ICONS[name] ?? '' }} {...rest} />;
}

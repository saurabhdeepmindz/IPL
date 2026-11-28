/**
 * @file    HfField.tsx
 * @module  HF
 *
 * @description
 * Field. In plain words: a labelled field of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-001
 * @subtask        ST-ADM01-001-FE-03
 * @hf             HF-ADM-01 #new #edit #view
 * @source         built outside the LLD (a helper ported from the high-fidelity design)
 * @status         built
 */

import type { ReactNode } from 'react';
import { hf } from './hf';
import { HfIcon } from './HfIcon';

interface HfFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  help?: string;
  error?: string;
  children: ReactNode;
}

/**
 * HfField.
 *
 * In plain words: one labelled field of the high-fidelity design: the label with the red star, the control, the grey help line and the red message when the field is wrong.
 */
export function HfField({ label, htmlFor, required = false, help, error, children }: HfFieldProps) {
  return (
    <div className={hf('field', error && 'invalid')}>
      <label htmlFor={htmlFor}>
        {label}
        {required && <span className={hf('req')}>*</span>}
      </label>
      {children}
      {help && (
        <span className={hf('help')}>
          <span>
            <HfIcon name="info" />
          </span>
          {help}
        </span>
      )}
      <span className={hf('err')} role={error ? 'alert' : undefined}>
        <span>
          <HfIcon name="alertC" />
        </span>
        <span>{error}</span>
      </span>
    </div>
  );
}

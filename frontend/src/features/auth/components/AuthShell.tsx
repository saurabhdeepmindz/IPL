/**
 * @file    AuthShell.tsx
 * @module  Auth
 *
 * @description
 * Frame of the sign-in screens. In plain words: header, brand panel, card, legal line and footer of the design.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005
 * @subtask        ST-LGN01-005-FE-01
 * @lld            LLD-EPIC-LGN-01 v0.5 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/features/auth/components/AuthShell.tsx
 * @lld-synced     v0.5
 * @hf             LGN-01, LGN-02
 * @status         built
 */

import type { ReactNode } from 'react';
import '@/styles/hf-auth.css';
import '@/styles/hf-overrides.css';
import { hf, HF_SCOPE } from '../hf/hf';

/**
 * AuthShell.
 *
 * In plain words: with `wide` the brand panel is left out and the card fills the page (the "Opening your dashboard" screen). The page frame of every sign-in screen in the high-fidelity design: the header (logo, name, Help, Contact IT team), the brand panel on the left, the card on the right, the legal line and the footer. `card` is what goes in the white card.
 */
export function AuthShell({
  children,
  helpEmail,
  wide = false,
}: {
  children: ReactNode;
  helpEmail: string;
  wide?: boolean;
}) {
  return (
    <div className={HF_SCOPE}>
      <header className={hf('ah')}>
        <a className={hf('brand')} href="/login" aria-label="IPL AMS sign in">
          <span className={hf('logo')}>
            IPL
            <br />
            logo
          </span>
          <span className={hf('txt')}>
            <b>IPL AMS</b>
            <small>Approval Management System</small>
          </span>
        </a>
        <nav>
          <a className={hf('btn btn-text sm hide-sm')} href="/login#help">
            Help
          </a>
          <a className={hf('btn btn-text sm')} href={`mailto:${helpEmail}`}>
            Contact IT team
          </a>
        </nav>
      </header>
      <main
        className={hf('auth')}
        id="main-content"
        style={wide ? { gridTemplateColumns: 'minmax(0,1fr)' } : undefined}
      >
        {wide ? null : (
          <section className={hf('brandp')} aria-label="About AMS">
            <small>Indian Potash Limited</small>
            <h2>Approvals, in one place</h2>
            <p>
              Create, route and approve proposals — General and Financial Concurrence — with digital
              signature and a complete audit trail.
            </p>
            <ol>
              <li>
                <span>1</span>Raise a proposal and pick the approval path
              </li>
              <li>
                <span>2</span>Approve, return or discuss — on desktop or phone
              </li>
              <li>
                <span>3</span>Track every step and who holds it
              </li>
            </ol>
          </section>
        )}
        <section className={hf('pane')}>
          <div className={hf('acard')} style={wide ? { textAlign: 'left' } : undefined}>
            {children}
          </div>
          <p className={hf('legal')}>
            For authorised IPL users only. Sign-ins and actions are recorded in the audit trail.
          </p>
        </section>
      </main>
      <footer className={hf('af')}>
        <span>Indian Potash Limited · Approval Management System</span>
        <a href={`mailto:${helpEmail}`}>Contact IT team</a>
        <a href="#">Privacy policy</a>
        <span style={{ marginLeft: 'auto' }}>Deepmindz Innovations · high-fidelity mockup</span>
      </footer>
    </div>
  );
}

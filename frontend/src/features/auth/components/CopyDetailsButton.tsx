/**
 * @file    CopyDetailsButton.tsx
 * @module  Auth
 *
 * @description
 * The "Copy my details for the IT team" button. In plain words: writes a short text (name, employee code, reference) to the clipboard so the user can paste it into an e-mail, and says "Details copied" for a few seconds.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-004
 * @subtask        ST-LGN03-004-FE-02
 * @screen         LGN-10
 * @lld            LLD-EPIC-LGN-03 v0.3 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.3.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/src/features/auth/components/CopyDetailsButton.tsx
 * @lld-synced     v0.3
 * @status         built
 */
'use client';

import { useEffect, useState } from 'react';
import { hf } from '../hf/hf';
import { Icon } from '../hf/Icon';

/**
 * CopyDetailsButton.
 *
 * In plain words: copies the text and shows a short confirmation; if the browser refuses the clipboard, the confirmation is not shown.
 *
 * @epic      EPIC-LGN-03
 * @story     US-LGN03-004
 * @subtask   ST-LGN03-004-FE-02
 * @workflow  UF-03
 * @screen    LGN-10
 * @ac        AC-US-LGN03-004-01
 * @lld       LLD-EPIC-LGN-03 v0.3 §6.1
 * @status    built
 *
 * @param props.text The text to copy
 */
export function CopyDetailsButton(props: { text: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 4000);
    return () => clearTimeout(timer);
  }, [copied]);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(props.text);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };
  return (
    <>
      <button className={hf('btn btn-outline')} id="copy" type="button" onClick={copy} data-testid="copy-details">
        <Icon name="copy" />
        Copy my details for the IT team
      </button>
      {copied ? (
        <p className={hf('help')} role="status" data-testid="copied">
          <strong>Details copied</strong> Paste them into your e-mail to the IT team.
        </p>
      ) : null}
    </>
  );
}

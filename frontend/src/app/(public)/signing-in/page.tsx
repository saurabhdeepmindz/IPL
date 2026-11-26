/**
 * @file    page.tsx
 * @module  Auth
 *
 * @description
 * The /signing-in route. In plain words: renders the single sign-on states from the address.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-007
 * @subtask        ST-LGN01-007-FE-02
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/src/app/(public)/signing-in/page.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { SsoStatusPage } from '@/features/auth/components/SsoStatusPage';

export const metadata: Metadata = { title: 'Single sign-on' };

/**
 * Single sign-on status route.
 *
 * In plain words: reads `state` and `ref` from the address and shows the matching status (no state means waiting).
 *
 * @story US-LGN01-007
 * @subtask ST-LGN01-007-FE-02
 */
type SigningInSearch = Promise<{ state?: string; ref?: string }>;

export default function SigningInPage(props: { searchParams: SigningInSearch }) {
  return (
    <Suspense fallback={<main id="main-content" className="container py-5" aria-busy="true" />}>
      <SigningInContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function SigningInContent(props: { searchParams: SigningInSearch }) {
  const { state, ref } = await props.searchParams;
  return <SsoStatusPage state={state ?? 'waiting'} reference={ref} />;
}

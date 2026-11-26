/**
 * @file    page.tsx
 * @module  App
 *
 * @description
 * Sign-in route (placeholder until the sign-in epic). In plain words: the page people land on first.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */

import { Suspense } from 'react';
import type { Metadata } from 'next';
import { DevSignInForm } from '@/features/auth/components/DevSignInForm';
import { SignInPage } from '@/features/auth/components/SignInPage';
import { env } from '@/lib/env';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Login route.
 *
 * In plain words: shows the sign-in page. The old development form stays reachable at `/login?dev=1` while development sign-in is on, so the earlier journeys keep working until IT-ADM-LGN replaces them.
 */
type LoginSearch = Promise<{ next?: string; dev?: string }>;

export default function LoginPage(props: { searchParams: LoginSearch }) {
  return (
    <Suspense fallback={<main id="main-content" className="container py-5" aria-busy="true" />}>
      <LoginContent searchParams={props.searchParams} />
    </Suspense>
  );
}

async function LoginContent(props: { searchParams: LoginSearch }) {
  const { next, dev } = await props.searchParams;
  if (dev === '1' && env.NEXT_PUBLIC_DEV_SIGN_IN === 'true') {
    return (
      <main id="main-content" className="container py-5" data-testid="login-placeholder">
        <h1 className="h3">Sign in</h1>
        <p>Development sign-in.</p>
        <DevSignInForm />
      </main>
    );
  }
  return <SignInPage next={next} />;
}

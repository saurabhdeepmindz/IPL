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
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <main id="main-content" className="container py-5" data-testid="login-placeholder">
      <h1 className="h3">Sign in</h1>
      <p>The sign-in screen arrives with the sign-in epic.</p>
    </main>
  );
}

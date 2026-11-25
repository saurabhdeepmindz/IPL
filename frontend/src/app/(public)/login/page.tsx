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
import { DevSignInForm } from '@/features/auth/components/DevSignInForm';

export const metadata: Metadata = { title: 'Sign in' };

/**
 * Login page. In plain words: the placeholder text and, in dev and test only, the development form.
 *
 * @epic      EPIC-ADM-01
 * @story     US-ADM01-012
 * @subtask   ST-ADM01-012-FE-04
 * @frd       FR-043.1, FR-043.2, FR-043.3, FR-043.5, FR-042.5, FR-043.4
 * @workflow  AD-03
 * @screen    ADM-02
 * @ac        AC-US012-01
 * @lld       LLD-EPIC-ADM-01 v0.21 §6.5
 * @status    built
 *
 * @dependencies DevSignInForm
 *
 * @returns The page
 */
export default function LoginPage() {
  return (
    <main id="main-content" className="container py-5" data-testid="login-placeholder">
      <h1 className="h3">Sign in</h1>
      <p>The sign-in screen arrives with the sign-in epic.</p>
      <DevSignInForm />
    </main>
  );
}

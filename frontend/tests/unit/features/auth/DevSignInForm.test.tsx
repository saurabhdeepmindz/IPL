/**
 * @file    DevSignInForm.test.tsx
 * @module  Tests
 *
 * @description
 * Vitest supporting tests of the development sign-in form (written before the code). In plain words: hidden unless the flag is on; signs in through the service and opens the roles screen; shows the error of a refused sign-in.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @story          US-ADM01-012, US-ADM01-013
 * @subtask        ST-ADM01-012-FE-04
 * @lld            LLD-EPIC-ADM-01 v0.21 §6.5
 * @lld-file       docs/lld/EPIC-ADM-01/LLD-EPIC-ADM-01-Users-Roles-and-Permissions-v0.21.md
 * @pseudo-source  docs/lld/EPIC-ADM-01/pseudo-code/tests/unit/features/auth/DevSignInForm.test.tsx
 * @lld-synced     v0.21
 * @status         built
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DevSignInForm } from '@/features/auth/components/DevSignInForm';
import { devSignIn } from '@/features/auth/services/auth.service';
import { ApiError } from '@/lib/errors';
import { useSessionStore } from '@/store/session.store';

const push = vi.fn();
const flag = { on: 'true' };
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
vi.mock('@/lib/env', () => ({
  env: {
    get NEXT_PUBLIC_DEV_SIGN_IN() {
      return flag.on;
    },
  },
}));
vi.mock('@/features/auth/services/auth.service', () => ({ devSignIn: vi.fn() }));

describe('DevSignInForm (supporting tests)', () => {
  beforeEach(() => {
    flag.on = 'true';
    push.mockClear();
    vi.mocked(devSignIn).mockReset();
    useSessionStore.getState().signOut();
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. With the flag off nothing is shown; with it on the form signs in, fills the session and opens /roles.
   */
  it('is hidden with the flag off and signs in with it on', async () => {
    flag.on = 'false';
    const { unmount } = render(<DevSignInForm />);
    expect(screen.queryByRole('button', { name: 'Sign in' })).not.toBeInTheDocument();
    unmount();
    flag.on = 'true';
    vi.mocked(devSignIn).mockResolvedValue({ userId: 'u1', employeeCode: '10001', companyCode: 'IPL' });
    render(<DevSignInForm />);
    await userEvent.type(screen.getByLabelText(/Employee code/), '10001');
    await userEvent.type(screen.getByLabelText(/Company/), 'IPL');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(devSignIn).toHaveBeenCalledWith('10001', 'IPL');
    expect(useSessionStore.getState().status).toBe('signedIn');
    expect(push).toHaveBeenCalledWith('/roles');
  });

  /**
   * @story     US-ADM01-012, US-ADM01-013
   * @ac        AC-US012-01
   * @subtask   ST-ADM01-012-FE-04
   * In plain words: supporting test. A refused sign-in shows the message of the API and opens no screen.
   */
  it('shows the error of a refused sign-in', async () => {
    vi.mocked(devSignIn).mockRejectedValue(new ApiError(401, 'UNAUTHENTICATED', 'Unknown user'));
    render(<DevSignInForm />);
    await userEvent.type(screen.getByLabelText(/Employee code/), '99999');
    await userEvent.type(screen.getByLabelText(/Company/), 'IPL');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));
    expect(await screen.findByText('Unknown user')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });
});

/**
 * @file    SignInStates.stories.tsx
 * @module  Auth
 *
 * @description
 * Storybook stories of the sign-in screens. In plain words: one story per state (ready, wrong password, locked, inactive, single sign-on failures, test banner), checked for accessibility.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-LGN01-005, US-LGN01-006, US-LGN01-007
 * @subtask        ST-LGN01-005-FE-03
 * @lld            LLD-EPIC-LGN-01 v0.4 §6.4
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-01/LLD-EPIC-LGN-01-Sign-in-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-01/pseudo-code/stories/auth/SignInStates.stories.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SignInErrorPanel } from '@/features/auth/components/SignInErrorPanel';
import { SignInPage } from '@/features/auth/components/SignInPage';
import { SsoStatusPage } from '@/features/auth/components/SsoStatusPage';
import type { PublicConfig } from '@/features/auth/types/auth.types';
import { ApiError } from '@/lib/errors';

const helpdesk = { phone: '+91 11 2345 6789', email: 'it@ipl.example', hours: 'Mon-Sat 9-18', placeholder: false };
const withConfig = (config: PublicConfig) =>
  function WithConfig(Story: () => React.JSX.Element) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['auth.publicConfig'], config);
  return (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  );
  };

const meta = { title: 'Auth/SignIn', parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } } } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

const real: PublicConfig = { ssoAvailable: true, idpMode: 'saml', helpdesk };

export const Ready: Story = { decorators: [withConfig(real)], render: () => <SignInPage /> };
export const TestBanner: Story = { decorators: [withConfig({ ...real, idpMode: 'stub' })], render: () => <SignInPage /> };
export const WrongPassword: Story = { decorators: [withConfig(real)], render: () => <SignInErrorPanel error={new ApiError(401, 'INVALID_CREDENTIALS', 'x', {}, { attemptsLeft: 3 })} /> };
export const Locked: Story = { decorators: [withConfig(real)], render: () => <SignInErrorPanel error={new ApiError(423, 'ACCOUNT_LOCKED', 'x', {}, { lockedUntil: '2026-11-26T10:15:00.000Z', reference: 'LCK-1002-8H3K' })} /> };
export const Inactive: Story = { decorators: [withConfig(real)], render: () => <SignInErrorPanel error={new ApiError(403, 'ACCOUNT_INACTIVE', 'x', {}, { reference: 'INA-4411-Q7ZP' })} /> };
export const SsoFailed: Story = { decorators: [withConfig(real)], render: () => <SsoStatusPage state="failed" reference="FAI-1234-ABCD" /> };
export const SsoNoAccount: Story = { decorators: [withConfig(real)], render: () => <SsoStatusPage state="noaccount" reference="NOA-9911-WXYZ" /> };
export const SsoCancelled: Story = { decorators: [withConfig(real)], render: () => <SsoStatusPage state="cancelled" /> };

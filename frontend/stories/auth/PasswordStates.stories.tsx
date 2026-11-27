/**
 * @file    PasswordStates.stories.tsx
 * @module  Auth
 *
 * @description
 * Storybook stories of the password screens. In plain words: one story per state (request, set, expired, changed and the rules list in four states; the temporary-password page is added with its page), checked for accessibility.
 *
 * @author  Deepmindz AMS team
 * @version 1.0.0
 * @since   2026-11-26
 *
 * @story          US-LGN02-007, US-LGN02-006, US-LGN02-008
 * @subtask        ST-LGN02-007-FE-03
 * @lld            LLD-EPIC-LGN-02 v0.5 §6.2
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-02/LLD-EPIC-LGN-02-Passwords-v0.5.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-02/pseudo-code/stories/auth/PasswordStates.stories.tsx
 * @lld-synced     v0.5
 * @status         built
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ForgotPasswordPage } from '@/features/auth/components/ForgotPasswordPage';
import { LinkExpiredPage } from '@/features/auth/components/LinkExpiredPage';
import { PasswordChangedPage } from '@/features/auth/components/PasswordChangedPage';
import { PasswordRules } from '@/features/auth/components/PasswordRules';
import { SetPasswordPage } from '@/features/auth/components/SetPasswordPage';
import { StrengthBar } from '@/features/auth/components/StrengthBar';
import type { PublicConfig } from '@/features/auth/types/auth.types';
import { HF_SCOPE } from '@/features/auth/hf/hf';
import '@/styles/hf-auth.css';
import '@/styles/hf-overrides.css';

const config: PublicConfig = {
  ssoAvailable: true,
  idpMode: 'saml',
  helpdesk: {
    phone: '+91 11 2345 6789',
    email: 'it@ipl.example',
    hours: 'Mon-Sat 9-18',
    placeholder: false,
  },
};

/** A query client that already holds the public settings and the link check, so no story calls the network. */
function withQueries(Story: () => React.JSX.Element) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['auth.publicConfig'], config);
  client.setQueryData(['reset-link', 'tok-1'], { valid: true, maskedEmail: 'k.***@ipl.example' });
  return (
    <QueryClientProvider client={client}>
      <Story />
    </QueryClientProvider>
  );
}

const card = (children: React.ReactNode) => (
  <div className={HF_SCOPE} style={{ maxWidth: 420, padding: 24 }}>
    {children}
  </div>
);

const meta = {
  title: 'Auth/Passwords',
  decorators: [withQueries],
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const RequestLink: Story = { render: () => <ForgotPasswordPage /> };
export const SetPasswordEmpty: Story = { render: () => <SetPasswordPage token="tok-1" /> };
export const LinkExpired: Story = { render: () => <SetPasswordPage token="" /> };
export const LinkExpiredCard: Story = { render: () => card(<LinkExpiredPage />) };
export const PasswordChangedCard: Story = { render: () => card(<PasswordChangedPage />) };
export const RulesNothingTyped: Story = {
  render: () =>
    card(
      <>
        <StrengthBar password="" />
        <PasswordRules password="" />
      </>,
    ),
};
export const RulesPartlyMet: Story = {
  render: () =>
    card(
      <>
        <StrengthBar password="abc12" />
        <PasswordRules password="abc12" />
      </>,
    ),
};
export const RulesAllMet: Story = {
  render: () =>
    card(
      <>
        <StrengthBar password="Abcdefg1@" />
        <PasswordRules password="Abcdefg1@" />
      </>,
    ),
};
export const RulesReusedPassword: Story = {
  render: () =>
    card(
      <>
        <StrengthBar password="Abcdefg1@" />
        <PasswordRules password="Abcdefg1@" reused />
      </>,
    ),
};

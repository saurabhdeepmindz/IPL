/**
 * @file    CompanyStates.stories.tsx
 * @module  Auth
 *
 * @description
 * Stories of the company screens. In plain words: the "Choose where to work" page with several companies and with one company, the Opening page and the placeholder of a dashboard that is not built yet, on data held in the query client so no story calls the network.
 *
 * @author  Deepmindz AMS team
 * @version 0.2.0
 * @since   2026-11-26
 *
 * @epic           EPIC-LGN-03
 * @story          US-LGN03-003, US-LGN03-004, US-LGN03-005
 * @subtask        ST-LGN03-003-FE-03
 * @lld            LLD-EPIC-LGN-03 v0.4 §6.1
 * @lld-file       docs/modules/LGN/lld/EPIC-LGN-03/LLD-EPIC-LGN-03-Company-year-landing-v0.4.md
 * @pseudo-source  docs/modules/LGN/lld/EPIC-LGN-03/pseudo-code/stories/auth/CompanyStates.stories.tsx
 * @lld-synced     v0.4
 * @status         built
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ChooseCompanyPage } from '@/features/auth/components/ChooseCompanyPage';
import { LandingGate } from '@/features/auth/components/LandingGate';
import { RoleDashboardPlaceholder } from '@/features/auth/components/RoleDashboardPlaceholder';
import { useSessionStore } from '@/store/session.store';
import type { PublicConfig } from '@/features/auth/types/auth.types';
import type { MeProfile } from '@/features/auth/types/me.types';
import '@/styles/hf-auth.css';
import '@/styles/hf-overrides.css';

const config: PublicConfig = {
  ssoAvailable: true,
  idpMode: 'saml',
  helpdesk: { phone: '+91 11 2345 6789', email: 'it@ipl.example', hours: 'Mon-Sat 9-18', placeholder: false },
};

const years = [
  { label: '2026-27', current: true },
  { label: '2025-26', current: false },
  { label: '2024-25', current: false },
];

const several: MeProfile = {
  employeeCode: '10234',
  name: 'R. Sharma',
  companies: [
    { code: '1000', name: 'Indian Potash Limited', roles: ['Initiator', 'Processor'] },
    { code: '2000', name: 'IPL Subsidiary (illustrative)', roles: ['Report Viewer'] },
  ],
  financialYears: years,
  context: null,
  helpdesk: config.helpdesk,
};

const one: MeProfile = {
  ...several,
  employeeCode: '10345',
  name: 'S. Iyer',
  companies: [{ code: '1000', name: 'Indian Potash Limited', roles: ['Initiator'] }],
};

/** A query client that already holds the public settings and the profile, so the page never calls the network. */
function withProfile(profile: MeProfile) {
  return function Decorator(Story: () => React.JSX.Element) {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(['auth.publicConfig'], config);
    client.setQueryData(['me'], profile);
    return (
      <QueryClientProvider client={client}>
        <Story />
      </QueryClientProvider>
    );
  };
}

const meta = {
  title: 'Auth/Company',
  parameters: { layout: 'fullscreen', nextjs: { appDirectory: true } },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

/** A user with two companies: the list starts on "Select a company" and the roles box appears after a choice. */
export const SeveralCompanies: Story = { decorators: [withProfile(several)], render: () => <ChooseCompanyPage /> };

/** A user with one company: it is preselected and its roles are shown. */
export const OneCompany: Story = { decorators: [withProfile(one)], render: () => <ChooseCompanyPage /> };

/** The Opening page of a user whose landing is the Finance Dashboard. */
export const Opening: Story = {
  decorators: [
    (Story) => {
      useSessionStore.setState({ status: 'signedIn', user: { userId: '', employeeCode: '10234', name: 'R. Sharma', companyCode: '1000', financialYear: '2026-27' }, landing: { role: 'FINANCE', route: '/landing/finance' } });
      return <Story />;
    },
    withProfile(several),
  ],
  render: () => <LandingGate />,
};

/** The placeholder of a dashboard that is not built yet. */
export const Placeholder: Story = { render: () => <RoleDashboardPlaceholder route="/landing/finance" /> };

// The stories NoAccess (US-LGN03-004) and Switcher (US-LGN03-005) need the main frame and are covered by the journeys.

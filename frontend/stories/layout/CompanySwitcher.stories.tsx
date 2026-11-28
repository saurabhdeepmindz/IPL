/**
 * @file    CompanySwitcher.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the company switcher. In plain words: the "Company" box of the header in its closed state, with the company of the session; opening it needs the server, so that state is covered by the journeys.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS17
 * @status  built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { expect, within } from 'storybook/test';
import { CompanySwitcher } from '@/components/layout/CompanySwitcher';
import { useSessionStore } from '@/store/session.store';

const meta = {
  title: 'Layout/CompanySwitcher',
  component: CompanySwitcher,
  parameters: { layout: 'padded', nextjs: { appDirectory: true } },
  decorators: [
    (Story) => {
      useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10002', companyCode: 'IPL' });
      return (
        <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
          <Story />
        </QueryClientProvider>
      );
    },
  ],
} satisfies Meta<typeof CompanySwitcher>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Closed: Story = {
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByTestId('company-switcher');
    await expect(button).toHaveAttribute('aria-expanded', 'false');
  },
};

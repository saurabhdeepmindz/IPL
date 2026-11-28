/**
 * @file    TopBar.stories.tsx
 * @module  Storybook
 *
 * @description
 * Story of the top bar. In plain words: the company and the signed-in user come from the session; with no session the bar shows a dash.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS17
 * @status  built
 */
import type { Meta, StoryObj } from '@storybook/react';
import { expect, within } from 'storybook/test';
import { TopBar } from '@/components/layout/TopBar';
import { useSessionStore } from '@/store/session.store';

const meta = {
  title: 'Layout/TopBar',
  component: TopBar,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof TopBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const SignedIn: Story = {
  decorators: [
    (Story) => {
      useSessionStore.getState().signIn({ userId: 'u1', employeeCode: '10002', companyCode: 'IPL' });
      return <Story />;
    },
  ],
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId('layout-company')).toHaveTextContent('IPL');
    await expect(within(canvasElement).getByTestId('layout-user')).toHaveTextContent('10002');
  },
};

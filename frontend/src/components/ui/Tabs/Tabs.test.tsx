/**
 * @file    Tabs.test.tsx
 * @module  UiComponents
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-03 for the tabs, written before the code. In plain words: one panel shows at a time, arrow keys move between tabs, and a disabled tab is skipped.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { Tabs } from './Tabs';

const tabs = [
  { id: 'all', label: 'All', count: 12, panel: <p>All users</p> },
  { id: 'active', label: 'Active', count: 9, panel: <p>Active users</p> },
  { id: 'old', label: 'Archived', disabled: true, panel: <p>Archived</p> },
  { id: 'locked', label: 'Locked', count: 1, panel: <p>Locked users</p> },
];

describe('Tabs', () => {
  it('shows the first tab and only its panel', () => {
    render(<Tabs ariaLabel="Users by status" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText('All users')).toBeVisible();
    expect(screen.queryByText('Active users')).not.toBeInTheDocument();
  });

  it('shows the count on a tab', () => {
    render(<Tabs ariaLabel="Users by status" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: /Locked/ })).toHaveTextContent('1');
  });

  it('a click selects a tab and reports it', async () => {
    const onChange = vi.fn();
    render(<Tabs ariaLabel="Users by status" tabs={tabs} onChange={onChange} />);
    await userEvent.click(screen.getByRole('tab', { name: /Active/ }));
    expect(onChange).toHaveBeenCalledWith('active');
    expect(screen.getByText('Active users')).toBeVisible();
  });

  it('arrow keys move between tabs and skip a disabled one', async () => {
    render(<Tabs ariaLabel="Users by status" tabs={tabs} defaultValue="active" />);
    screen.getByRole('tab', { name: /Active/ }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /Locked/ })).toHaveFocus();
    expect(screen.getByText('Locked users')).toBeVisible();
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: /All/ })).toHaveFocus();
  });

  it('only the selected tab is in the tab order', () => {
    render(<Tabs ariaLabel="Users by status" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: /All/ })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: /Active/ })).toHaveAttribute('tabindex', '-1');
  });

  it('a disabled tab cannot be chosen', () => {
    render(<Tabs ariaLabel="Users by status" tabs={tabs} />);
    expect(screen.getByRole('tab', { name: /Archived/ })).toBeDisabled();
  });
});

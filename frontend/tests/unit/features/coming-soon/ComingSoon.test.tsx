/**
 * @file    ComingSoon.test.tsx
 * @module  Tests
 *
 * @description
 * Unit cases of the Coming soon placeholder. In plain words: it names the feature and offers the way back.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-26
 *
 * @story          US-ADM01-017
 * @subtask        ST-ADM01-017-FE-01
 * @status         built
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ComingSoon } from '@/features/coming-soon';

describe('Coming soon placeholder', () => {
  it('names the feature, says it is coming and offers the way back (default: the dashboard)', () => {
    render(<ComingSoon feature="Notifications" />);
    expect(screen.getByRole('heading', { name: 'Notifications' })).toBeInTheDocument();
    expect(screen.getByText('Coming soon')).toBeInTheDocument();
    expect(screen.getByTestId('coming-soon-back')).toHaveAttribute('href', '/dashboard');
    expect(screen.getByTestId('coming-soon-back')).toHaveTextContent('Back to Dashboard');
  });

  it('can send the user back to another screen with its own words', () => {
    render(<ComingSoon feature="Admin Dashboard" backHref="/users" backLabel="Back to User Management" />);
    expect(screen.getByTestId('coming-soon-back')).toHaveAttribute('href', '/users');
    expect(screen.getByTestId('coming-soon-back')).toHaveTextContent('Back to User Management');
  });
});

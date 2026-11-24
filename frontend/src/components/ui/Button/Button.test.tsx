/**
 * @file    Button.test.tsx
 * @module  UiComponents
 *
 * @description
 * Tests of the button. In plain words: shows the button looks and behaves as agreed.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button (UX4G)', () => {
  it('renders UX4G primary classes by default', () => {
    render(<Button>Save</Button>);
    const btn = screen.getByRole('button', { name: 'Save' });
    expect(btn).toHaveClass('btn', 'btn-primary');
    expect(btn).toHaveAttribute('type', 'button');
  });

  it('renders outline variant', () => {
    render(
      <Button variant="danger" outline>
        Delete
      </Button>,
    );
    expect(screen.getByRole('button')).toHaveClass('btn-outline-danger');
  });

  it('is disabled and busy while loading', () => {
    render(<Button isLoading>Submit</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute('aria-busy', 'true');
  });
});

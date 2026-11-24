/**
 * @file    Select.test.tsx
 * @module  UiComponents
 *
 * @description
 * Supporting tests of ST-ADM01-000-FE-03 for the select, written before the code. In plain words: it shows its label and choices, reports a choice, shows errors and can be disabled.
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
import { Select } from './Select';

const options = [
  { value: 'IPL', label: 'IPL' },
  { value: 'IPLFB', label: 'IPLFB' },
  { value: 'OLD', label: 'Old company', disabled: true },
];

describe('Select', () => {
  it('has a label and all its choices', () => {
    render(<Select label="Company" options={options} placeholder="Select a company" />);
    const select = screen.getByLabelText('Company');
    expect(select).toHaveClass('form-select');
    expect(screen.getAllByRole('option')).toHaveLength(4);
  });

  it('reports the choice by keyboard or mouse', async () => {
    const onChange = vi.fn();
    render(<Select label="Company" options={options} placeholder="Select" onChange={(e) => onChange(e.target.value)} />);
    await userEvent.selectOptions(screen.getByLabelText('Company'), 'IPLFB');
    expect(onChange).toHaveBeenCalledWith('IPLFB');
  });

  it('shows an error and ties it to the field', () => {
    render(<Select label="Company" options={options} error="Pick a company" />);
    const select = screen.getByLabelText('Company');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Pick a company');
    expect(screen.getByRole('alert')).toHaveTextContent('Pick a company');
  });

  it('shows a hint when there is no error', () => {
    render(<Select label="Company" options={options} hint="The company the user works in" />);
    expect(screen.getByLabelText('Company')).toHaveAccessibleDescription('The company the user works in');
  });

  it('can be disabled', () => {
    render(<Select label="Company" options={options} disabled />);
    expect(screen.getByLabelText('Company')).toBeDisabled();
  });
});

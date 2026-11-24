/**
 * @file    Button.stories.tsx
 * @module  Storybook
 *
 * @description
 * Storybook examples. In plain words: shows the component or token in each state.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'Components/Button',
  parameters: {
    layout: 'padded',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Solid Buttons</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Standard solid buttons with brand colors overriding primary (teal) and secondary (gold).
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary">Primary</button>
          <button type="button" className="btn btn-secondary">Secondary</button>
          <button type="button" className="btn btn-success">Success</button>
          <button type="button" className="btn btn-danger">Danger</button>
          <button type="button" className="btn btn-warning">Warning</button>
          <button type="button" className="btn btn-dark">Dark</button>
          <button type="button" className="btn btn-light">Light</button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Tonal Buttons</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Subtle tinted background buttons for secondary and tertiary actions.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-primary-tonal">Primary Tonal</button>
          <button type="button" className="btn btn-secondary-tonal">Secondary Tonal</button>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>Outline Buttons</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>
          Border-only buttons with brand color hover states.
        </p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" className="btn btn-outline-primary">Outline Primary</button>
          <button type="button" className="btn btn-outline-secondary">Outline Secondary</button>
          <button type="button" className="btn btn-outline-success">Outline Success</button>
          <button type="button" className="btn btn-outline-danger">Outline Danger</button>
          <button type="button" className="btn btn-outline-warning">Outline Warning</button>
          <button type="button" className="btn btn-outline-dark">Outline Dark</button>
        </div>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '800px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>Small (.btn-sm)</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-sm">Primary Small</button>
          <button type="button" className="btn btn-secondary btn-sm">Secondary Small</button>
          <button type="button" className="btn btn-primary-tonal btn-sm">Tonal Small</button>
          <button type="button" className="btn btn-outline-primary btn-sm">Outline Small</button>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>Default Size</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary">Primary Default</button>
          <button type="button" className="btn btn-secondary">Secondary Default</button>
          <button type="button" className="btn btn-primary-tonal">Tonal Default</button>
          <button type="button" className="btn btn-outline-primary">Outline Default</button>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>Large (.btn-lg)</h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary btn-lg">Primary Large</button>
          <button type="button" className="btn btn-secondary btn-lg">Secondary Large</button>
          <button type="button" className="btn btn-primary-tonal btn-lg">Tonal Large</button>
          <button type="button" className="btn btn-outline-primary btn-lg">Outline Large</button>
        </div>
      </div>
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '900px' }}>
      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>
          Primary Button States
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary">Normal</button>
          <button type="button" className="btn btn-primary active">Active (.active)</button>
          <button type="button" className="btn btn-primary" disabled>Disabled (attr)</button>
          <button type="button" className="btn btn-primary disabled" aria-disabled="true">Disabled (.disabled)</button>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>
          Secondary Button States
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-secondary">Normal</button>
          <button type="button" className="btn btn-secondary active">Active (.active)</button>
          <button type="button" className="btn btn-secondary" disabled>Disabled (attr)</button>
          <button type="button" className="btn btn-secondary disabled" aria-disabled="true">Disabled (.disabled)</button>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>
          Tonal Button States
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary-tonal">Normal</button>
          <button type="button" className="btn btn-primary-tonal active">Active (.active)</button>
          <button type="button" className="btn btn-primary-tonal" disabled>Disabled (attr)</button>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#444' }}>
          Outline Button States
        </h4>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline-primary">Normal</button>
          <button type="button" className="btn btn-outline-primary active">Active (.active)</button>
          <button type="button" className="btn btn-outline-primary" disabled>Disabled (attr)</button>
        </div>
      </div>
    </div>
  ),
};

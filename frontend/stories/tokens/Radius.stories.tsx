/**
 * @file    Radius.stories.tsx
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
import { useEffect, useRef, useState } from 'react';

interface RadiusStep {
  tokenKey: string;
  varName: string;
  label: string;
  defaultVal: string;
  description: string;
}

const RADIUS_STEPS: RadiusStep[] = [
  {
    tokenKey: 'radius-sm',
    varName: '--bs-border-radius-sm',
    label: 'Small',
    defaultVal: '6px',
    description: 'Badges, small tags, tooltips, and compact elements',
  },
  {
    tokenKey: 'radius-md',
    varName: '--bs-border-radius',
    label: 'Default / Medium',
    defaultVal: '8px',
    description: 'Buttons, form controls, dropdowns, and basic cards',
  },
  {
    tokenKey: 'radius-lg',
    varName: '--bs-border-radius-lg',
    label: 'Large',
    defaultVal: '12px',
    description: 'Modal dialogs, feature banners, and prominent containers',
  },
  {
    tokenKey: 'radius-xl',
    varName: '--bs-border-radius-xl',
    label: 'Extra Large',
    defaultVal: '16px',
    description: 'Promotional callouts and layered surface wrappers',
  },
  {
    tokenKey: 'radius-2xl',
    varName: '--bs-border-radius-2xl',
    label: '2X Large',
    defaultVal: '20px',
    description: 'Hero section panels and heavy overlay surfaces',
  },
  {
    tokenKey: 'radius-full',
    varName: '--bs-border-radius-pill',
    label: 'Pill / Full',
    defaultVal: '999px',
    description: 'Pill badges, rounded avatar chips, and search bars',
  },
];

function RadiusCard({ step }: { step: RadiusStep }) {
  const [resolvedValue, setResolvedValue] = useState('');
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const rawVal = getComputedStyle(document.documentElement).getPropertyValue(step.varName).trim();
      if (rawVal) {
        setResolvedValue(rawVal);
      } else if (boxRef.current) {
        setResolvedValue(getComputedStyle(boxRef.current).borderRadius || step.defaultVal);
      } else {
        setResolvedValue(step.defaultVal);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [step.varName, step.defaultVal]);

  return (
    <div
      style={{
        border: '1px solid #e0e0e0',
        borderRadius: '10px',
        padding: '20px',
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>{step.label}</span>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '12px',
            fontWeight: 700,
            color: '#00646B',
            background: '#EDF7F8',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {resolvedValue || step.defaultVal}
        </span>
      </div>

      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
        <div>Variable: <code style={{ color: '#00646B' }}>{step.varName}</code></div>
        <div>Token: <code style={{ color: '#555' }}>borderRadius.{step.tokenKey}</code></div>
      </div>

      {/* Visual Box with Radius Applied */}
      <div
        ref={boxRef}
        style={{
          width: '100%',
          height: '110px',
          backgroundColor: '#00646B',
          borderRadius: `var(${step.varName}, ${step.defaultVal})`,
          border: '3px solid #F2B705',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.2)',
        }}
      >
        radius: {resolvedValue || step.defaultVal}
      </div>

      <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>{step.description}</p>
    </div>
  );
}

function RadiusShowcase() {
  useEffect(() => {
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'brand');
    }
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>Design Tokens — Border Radius</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Brand border radius scale overriding Bootstrap variables (<code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>--bs-border-radius-*</code>).
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
          gap: '24px',
        }}
      >
        {RADIUS_STEPS.map((step) => (
          <RadiusCard key={step.tokenKey} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Tokens/Radius',
  component: RadiusShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof RadiusShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

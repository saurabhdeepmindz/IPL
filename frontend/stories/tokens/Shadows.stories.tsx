/**
 * @file    Shadows.stories.tsx
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

interface ShadowStep {
  tokenName: string;
  varName: string;
  label: string;
  description: string;
  fallback: string;
}

const SHADOW_STEPS: ShadowStep[] = [
  {
    tokenName: 'shadow-xs',
    varName: '--brand-shadow-xs',
    label: 'Extra Small',
    description: 'Subtle elevation for cards, dropdown menus, and hover states',
    fallback: '0px 2px 3px 1px rgba(33, 33, 33, 0.12)',
  },
  {
    tokenName: 'shadow-s',
    varName: '--brand-shadow-s',
    label: 'Small',
    description: 'Low elevation for resting cards and interactive tiles',
    fallback: '0px 4px 4px 0px rgba(33, 33, 33, 0.12), 0px 1px 3px 1px rgba(33, 33, 33, 0.10)',
  },
  {
    tokenName: 'shadow-md',
    varName: '--brand-shadow-md',
    label: 'Medium',
    description: 'Medium elevation for floating buttons, popovers, and sticky headers',
    fallback: '0px 6px 8px -2px rgba(33, 33, 33, 0.20), 0px 2px 8px -2px rgba(33, 33, 33, 0.04)',
  },
  {
    tokenName: 'shadow-lg',
    varName: '--brand-shadow-lg',
    label: 'Large',
    description: 'Elevated containers, drawers, and active drag states',
    fallback: '0px 4px 6px -2px rgba(33, 33, 33, 0.03), 0px 12px 16px -4px rgba(33, 33, 33, 0.08)',
  },
  {
    tokenName: 'shadow-xl',
    varName: '--brand-shadow-xl',
    label: 'Extra Large',
    description: 'Modal dialogs, action sheets, and priority alert banners',
    fallback: '0px 24px 48px -12px rgba(33, 33, 33, 0.18)',
  },
  {
    tokenName: 'shadow-2xl',
    varName: '--brand-shadow-2xl',
    label: '2X Large',
    description: 'Highest elevation for full-screen takeovers and global overlays',
    fallback: '0px 32px 64px -12px rgba(33, 33, 33, 0.14)',
  },
];

function ShadowCard({ step }: { step: ShadowStep }) {
  const [computedShadow, setComputedShadow] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const rawVal = getComputedStyle(document.documentElement).getPropertyValue(step.varName).trim();
      if (rawVal) {
        setComputedShadow(rawVal);
      } else if (cardRef.current) {
        setComputedShadow(getComputedStyle(cardRef.current).boxShadow || step.fallback);
      } else {
        setComputedShadow(step.fallback);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [step.varName, step.fallback]);

  return (
    <div
      ref={cardRef}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: `var(${step.varName}, ${step.fallback})`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '190px',
        border: '1px solid rgba(0,0,0,0.05)',
      }}
    >
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#111' }}>{step.label}</h3>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: '12px',
              fontWeight: 700,
              color: '#00646B',
              backgroundColor: '#EDF7F8',
              padding: '2px 8px',
              borderRadius: '4px',
            }}
          >
            {step.tokenName}
          </span>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666', marginBottom: '12px' }}>
          {step.varName}
        </div>
        <p style={{ fontSize: '13px', color: '#555', margin: 0 }}>{step.description}</p>
      </div>

      <div
        style={{
          marginTop: '16px',
          padding: '8px 10px',
          background: '#f8f9fa',
          borderRadius: '6px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#444',
          wordBreak: 'break-all',
        }}
      >
        <strong>box-shadow:</strong> {computedShadow || step.fallback}
      </div>
    </div>
  );
}

function ShadowsShowcase() {
  useEffect(() => {
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'brand');
    }
  }, []);

  return (
    <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '1200px', backgroundColor: '#f5f7f8', minHeight: '100vh' }}>
      <div style={{ marginBottom: '28px', borderBottom: '1px solid #ddd', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>Design Tokens — Box Shadows</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Brand elevation system with 6 distinct shadow steps (<code style={{ background: '#fff', padding: '2px 6px', borderRadius: '4px' }}>--brand-shadow-*</code>) providing depth hierarchy.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '28px',
        }}
      >
        {SHADOW_STEPS.map((step) => (
          <ShadowCard key={step.tokenName} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Tokens/Shadows',
  component: ShadowsShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ShadowsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

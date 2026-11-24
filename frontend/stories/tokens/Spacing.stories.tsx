/**
 * @file    Spacing.stories.tsx
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

interface SpacingStep {
  tokenName: string;
  varName: string;
  defaultPx: number;
  tailwindClass: string;
}

const SPACING_STEPS: SpacingStep[] = [
  { tokenName: 'spacing-none', varName: '--brand-spacing-none', defaultPx: 0, tailwindClass: 'tw:p-brand-none' },
  { tokenName: 'spacing-xxs', varName: '--brand-spacing-xxs', defaultPx: 2, tailwindClass: 'tw:p-brand-xxs' },
  { tokenName: 'spacing-xs', varName: '--brand-spacing-xs', defaultPx: 4, tailwindClass: 'tw:p-brand-xs' },
  { tokenName: 'spacing-sm', varName: '--brand-spacing-sm', defaultPx: 8, tailwindClass: 'tw:p-brand-sm' },
  { tokenName: 'spacing-md', varName: '--brand-spacing-md', defaultPx: 12, tailwindClass: 'tw:p-brand-md' },
  { tokenName: 'spacing-lg', varName: '--brand-spacing-lg', defaultPx: 16, tailwindClass: 'tw:p-brand-lg' },
  { tokenName: 'spacing-xl', varName: '--brand-spacing-xl', defaultPx: 20, tailwindClass: 'tw:p-brand-xl' },
  { tokenName: 'spacing-2xl', varName: '--brand-spacing-2xl', defaultPx: 24, tailwindClass: 'tw:p-brand-2xl' },
  { tokenName: 'spacing-3xl', varName: '--brand-spacing-3xl', defaultPx: 32, tailwindClass: 'tw:p-brand-3xl' },
  { tokenName: 'spacing-4xl', varName: '--brand-spacing-4xl', defaultPx: 40, tailwindClass: 'tw:p-brand-4xl' },
  { tokenName: 'spacing-5xl', varName: '--brand-spacing-5xl', defaultPx: 48, tailwindClass: 'tw:p-brand-5xl' },
  { tokenName: 'spacing-6xl', varName: '--brand-spacing-6xl', defaultPx: 56, tailwindClass: 'tw:p-brand-6xl' },
  { tokenName: 'spacing-7xl', varName: '--brand-spacing-7xl', defaultPx: 64, tailwindClass: 'tw:p-brand-7xl' },
  { tokenName: 'spacing-8xl', varName: '--brand-spacing-8xl', defaultPx: 72, tailwindClass: 'tw:p-brand-8xl' },
  { tokenName: 'spacing-9xl', varName: '--brand-spacing-9xl', defaultPx: 80, tailwindClass: 'tw:p-brand-9xl' },
];

function SpacingRow({ step }: { step: SpacingStep }) {
  const [resolvedValue, setResolvedValue] = useState('');
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const computedVal = getComputedStyle(document.documentElement).getPropertyValue(step.varName).trim();
      if (computedVal) {
        setResolvedValue(computedVal);
      } else if (barRef.current) {
        const computedWidth = getComputedStyle(barRef.current).width;
        setResolvedValue(computedWidth || `${step.defaultPx}px`);
      } else {
        setResolvedValue(`${step.defaultPx}px`);
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [step.varName, step.defaultPx]);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 220px 90px 1fr',
        alignItems: 'center',
        padding: '10px 16px',
        borderBottom: '1px solid #f0f0f0',
        gap: '16px',
      }}
    >
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 700, color: '#111' }}>
          {step.tokenName}
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>{step.tailwindClass}</div>
      </div>
      <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00646B', fontWeight: 600 }}>
        {step.varName}
      </div>
      <div
        style={{
          fontFamily: 'monospace',
          fontSize: '12px',
          fontWeight: 700,
          color: '#333',
          background: '#f5f5f5',
          padding: '2px 8px',
          borderRadius: '4px',
          textAlign: 'center',
        }}
      >
        {resolvedValue || `${step.defaultPx}px`}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        <div
          ref={barRef}
          style={{
            width: `var(${step.varName}, ${step.defaultPx}px)`,
            height: '24px',
            backgroundColor: '#00646B',
            borderRadius: '4px',
            transition: 'width 0.2s ease',
            border: step.defaultPx === 0 ? '1px dashed #ccc' : 'none',
          }}
          title={`${step.tokenName}: ${resolvedValue || `${step.defaultPx}px`}`}
        />
        {step.defaultPx === 0 && (
          <span style={{ fontSize: '11px', color: '#999', marginLeft: '8px', fontStyle: 'italic' }}>(0px width)</span>
        )}
      </div>
    </div>
  );
}

function SpacingShowcase() {
  useEffect(() => {
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'brand');
    }
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1100px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>Design Tokens — Spacing Scale</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Visual representation of the 15 brand spacing tokens (<code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>--brand-spacing-none</code> to{' '}
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>--brand-spacing-9xl</code>) read from root computed styles.
        </p>
      </div>

      <div
        style={{
          border: '1px solid #e0e0e0',
          borderRadius: '10px',
          overflow: 'hidden',
          backgroundColor: '#fff',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 220px 90px 1fr',
            padding: '12px 16px',
            backgroundColor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            fontWeight: 700,
            fontSize: '12px',
            color: '#444',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            gap: '16px',
          }}
        >
          <div>Token Name</div>
          <div>CSS Variable</div>
          <div>Value</div>
          <div>Visual Bar (width)</div>
        </div>

        {SPACING_STEPS.map((step) => (
          <SpacingRow key={step.tokenName} step={step} />
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Tokens/Spacing',
  component: SpacingShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SpacingShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

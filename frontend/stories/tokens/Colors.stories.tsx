/**
 * @file    Colors.stories.tsx
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

function rgbToHex(rgbStr: string): string {
  const match = rgbStr.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!match) return rgbStr;
  const r = parseInt(match[1], 10).toString(16).padStart(2, '0');
  const g = parseInt(match[2], 10).toString(16).padStart(2, '0');
  const b = parseInt(match[3], 10).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

function ColorSwatch({ className, label }: { className: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [color, setColor] = useState('');

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (ref.current) {
        const computedBg = getComputedStyle(ref.current).backgroundColor;
        setColor(rgbToHex(computedBg));
      }
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        ref={ref}
        className={className}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{color}</div>
      </div>
    </div>
  );
}

function RootVarSwatch({ varName, label }: { varName: string; label: string }) {
  const [color, setColor] = useState('');
  const swatchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      const rawVal = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      if (rawVal) {
        setColor(rawVal.startsWith('#') ? rawVal.toUpperCase() : rgbToHex(rawVal));
      } else if (swatchRef.current) {
        const computed = getComputedStyle(swatchRef.current).backgroundColor;
        setColor(rgbToHex(computed));
      }
    });
    return () => cancelAnimationFrame(handle);
  }, [varName]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
      <div
        ref={swatchRef}
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '8px',
          backgroundColor: `var(${varName})`,
          border: '1px solid #e0e0e0',
          flexShrink: 0,
        }}
      />
      <div>
        <div style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600 }}>{label}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: '#00646B', fontWeight: 500 }}>{varName}</div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', color: '#666' }}>{color}</div>
      </div>
    </div>
  );
}

const SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

const CATEGORIES = [
  { name: 'Primary', classPrefix: 'primary', description: 'Deep Teal brand palette (#00646B base at 600)' },
  { name: 'Secondary', classPrefix: 'secondary', description: 'Vibrant Gold brand palette (#F2B705 base at 400)' },
  { name: 'Success', classPrefix: 'success', description: 'Functional Success palette for alerts and confirmations' },
  { name: 'Danger', classPrefix: 'danger', description: 'Functional Danger palette for errors and destructive actions' },
  { name: 'Warning', classPrefix: 'warning', description: 'Functional Warning palette for cautions and notices' },
  { name: 'Neutral / Gray', classPrefix: 'gray', description: 'Monochrome grayscale palette for text, borders, and surfaces' },
] as const;

function ColorsShowcase() {
  useEffect(() => {
    if (!document.documentElement.getAttribute('data-theme')) {
      document.documentElement.setAttribute('data-theme', 'brand');
    }
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>Design Tokens — Colors</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Brand color palette with tonal scales (50–900) and Bootstrap root CSS variable overrides under{' '}
          <code style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
            data-theme=&quot;brand&quot;
          </code>
          .
        </p>
      </div>

      {/* Root CSS Variables */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px', color: '#222' }}>
          Bootstrap Root CSS Variables
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '16px',
            background: '#fafafa',
            padding: '16px',
            borderRadius: '10px',
            border: '1px solid #eee',
          }}
        >
          <RootVarSwatch varName="--bs-primary" label="Primary (Brand Teal)" />
          <RootVarSwatch varName="--bs-secondary" label="Secondary (Brand Gold)" />
          <RootVarSwatch varName="--bs-success" label="Success" />
          <RootVarSwatch varName="--bs-danger" label="Danger" />
          <RootVarSwatch varName="--bs-warning" label="Warning" />
        </div>
      </div>

      {/* Tonal Scales Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {CATEGORIES.map((cat) => (
          <div
            key={cat.classPrefix}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '10px',
              padding: '16px',
              backgroundColor: '#fff',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{cat.name}</h3>
            <p style={{ fontSize: '12px', color: '#666', margin: '0 0 16px 0' }}>{cat.description}</p>
            <div>
              {SHADES.map((shade) => (
                <ColorSwatch
                  key={shade}
                  className={`bg-${cat.classPrefix}-${shade}`}
                  label={`.bg-${cat.classPrefix}-${shade}`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const meta = {
  title: 'Tokens/Colors',
  component: ColorsShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ColorsShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

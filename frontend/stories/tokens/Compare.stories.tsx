/**
 * @file    Compare.stories.tsx
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
import { useEffect, useState } from 'react';

const UX4G_DEFAULTS: Record<string, string> = {
  '--bs-primary': '#613AF5',
  '--bs-secondary': '#938BB6',
  '--bs-success': '#3C9718',
  '--bs-danger': '#B7131A',
  '--bs-warning': '#B77224',
  '--bs-border-radius': '0.375rem',
  '--bs-border-radius-sm': '0.25rem',
  '--bs-border-radius-lg': '0.5rem',
  '--bs-link-color': '#613AF5',
};

const BRAND_DEFAULTS: Record<string, string> = {
  '--bs-primary': '#00646B',
  '--bs-secondary': '#F2B705',
  '--bs-success': '#3c9718',
  '--bs-danger': '#b7131a',
  '--bs-warning': '#b77224',
  '--bs-border-radius': '8px',
  '--bs-border-radius-sm': '6px',
  '--bs-border-radius-lg': '12px',
  '--bs-link-color': '#00646B',
};

function normalizeVal(val: string): string {
  return val.trim().toLowerCase();
}

function isColor(val: string): boolean {
  return val.startsWith('#') || val.startsWith('rgb');
}

function TokenComparisonRow({
  varName,
  ux4gVal,
  brandVal,
}: {
  varName: string;
  ux4gVal: string;
  brandVal: string;
}) {
  const isOverridden = normalizeVal(ux4gVal) !== normalizeVal(brandVal);
  const colorToken = isColor(ux4gVal) || isColor(brandVal);

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontWeight: 600, color: '#222' }}>
        {varName}
      </td>

      {/* UX4G Default */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {colorToken && (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: ux4gVal,
                border: '1px solid #ccc',
                flexShrink: 0,
              }}
            />
          )}
          {!colorToken && (
            <div
              style={{
                width: '24px',
                height: '20px',
                borderRadius: ux4gVal,
                backgroundColor: '#eee',
                border: '1px solid #bbb',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#555' }}>{ux4gVal}</span>
        </div>
      </td>

      {/* Brand Value */}
      <td style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {colorToken && (
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                backgroundColor: brandVal,
                border: '1px solid #ccc',
                flexShrink: 0,
              }}
            />
          )}
          {!colorToken && (
            <div
              style={{
                width: '24px',
                height: '20px',
                borderRadius: brandVal,
                backgroundColor: '#00646B',
                opacity: 0.8,
                border: '1px solid #005257',
                flexShrink: 0,
              }}
            />
          )}
          <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: 600, color: '#00646B' }}>
            {brandVal}
          </span>
        </div>
      </td>

      {/* Status Badge */}
      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
        {isOverridden ? (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: '#EDF7F8',
              color: '#00646B',
              fontSize: '12px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '999px',
              border: '1px solid #ABE0E3',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#00646B' }} />
            Overridden ✓
          </span>
        ) : (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              backgroundColor: '#f5f5f5',
              color: '#777',
              fontSize: '12px',
              fontWeight: 500,
              padding: '4px 10px',
              borderRadius: '999px',
            }}
          >
            Same / Standard
          </span>
        )}
      </td>
    </tr>
  );
}

function CompareShowcase() {
  const [computedBrand, setComputedBrand] = useState<Record<string, string>>(BRAND_DEFAULTS);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (!document.documentElement.getAttribute('data-theme')) {
        document.documentElement.setAttribute('data-theme', 'brand');
      }

      const nextValues: Record<string, string> = {};
      for (const varName of Object.keys(UX4G_DEFAULTS)) {
        const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        nextValues[varName] = val || BRAND_DEFAULTS[varName] || UX4G_DEFAULTS[varName];
      }
      setComputedBrand(nextValues);
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>
          Theme Comparison: UX4G Default vs Brand Mode
        </h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          Side-by-side comparison between the stock UX4G Gov design system defaults (purple) and custom IPPB Brand overrides (teal & gold).
        </p>
      </div>

      {/* Visual Component Comparison Panels */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '24px',
          marginBottom: '36px',
        }}
      >
        {/* Left: UX4G Default Panel */}
        <div
          data-theme="ux4g"
          style={{
            border: '2px solid #613AF5',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(97, 58, 245, 0.08)',
          }}
        >
          <div
            style={{
              backgroundColor: '#613AF5',
              color: '#fff',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>UX4G Default Theme</h2>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>data-theme=&quot;ux4g&quot; / fallback</div>
            </div>
            <span
              style={{
                fontSize: '11px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              Standard
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Color Swatches */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Key Palette
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#613AF5', border: '1px solid #ccc' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Primary</div>
                    <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>#613AF5 (Purple)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: '#938BB6', border: '1px solid #ccc' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Secondary</div>
                    <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>#938BB6 (Muted)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Buttons
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#613AF5',
                    color: '#fff',
                    border: '1px solid #613AF5',
                    borderRadius: '0.375rem',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Primary
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: '#938BB6',
                    color: '#fff',
                    border: '1px solid #938BB6',
                    borderRadius: '0.375rem',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Secondary
                </button>
                <button
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#613AF5',
                    border: '1px solid #613AF5',
                    borderRadius: '0.375rem',
                    padding: '8px 16px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Outline
                </button>
              </div>
            </div>

            {/* Border Radius Sample Box */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Border Radius (0.375rem / 6px)
              </div>
              <div
                style={{
                  height: '44px',
                  borderRadius: '0.375rem',
                  backgroundColor: '#f3f0ff',
                  border: '2px solid #613AF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#613AF5',
                  fontWeight: 600,
                }}
              >
                radius: 0.375rem (6px)
              </div>
            </div>

            {/* Link */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>
                Link Style
              </div>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: '#613AF5', fontWeight: 600, textDecoration: 'underline' }}>
                Explore UX4G Documentation →
              </a>
            </div>
          </div>
        </div>

        {/* Right: Brand Overridden Panel */}
        <div
          data-theme="brand"
          style={{
            border: '2px solid #00646B',
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: '#fff',
            boxShadow: '0 4px 12px rgba(0, 100, 107, 0.12)',
          }}
        >
          <div
            style={{
              backgroundColor: '#00646B',
              color: '#fff',
              padding: '12px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>IPPB Brand Theme</h2>
              <div style={{ fontSize: '12px', opacity: 0.9 }}>data-theme=&quot;brand&quot; (Active Default)</div>
            </div>
            <span
              style={{
                fontSize: '11px',
                backgroundColor: '#F2B705',
                color: '#212121',
                padding: '2px 8px',
                borderRadius: '4px',
                fontWeight: 700,
              }}
            >
              Custom Overrides
            </span>
          </div>

          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Color Swatches */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Key Palette
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#00646B', border: '1px solid #005257' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Primary</div>
                    <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>#00646B (Teal)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F2B705', border: '1px solid #d4a004' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700 }}>Secondary</div>
                    <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>#F2B705 (Gold)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Buttons (with UX4G classes)
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary" style={{ cursor: 'pointer' }}>
                  Primary
                </button>
                <button type="button" className="btn btn-secondary" style={{ cursor: 'pointer' }}>
                  Secondary
                </button>
                <button type="button" className="btn btn-outline-primary" style={{ cursor: 'pointer' }}>
                  Outline
                </button>
                <button type="button" className="btn btn-primary-tonal" style={{ cursor: 'pointer' }}>
                  Tonal
                </button>
              </div>
            </div>

            {/* Border Radius Sample Box */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '8px' }}>
                Border Radius (8px brand radius-md)
              </div>
              <div
                style={{
                  height: '44px',
                  borderRadius: 'var(--bs-border-radius, 8px)',
                  backgroundColor: '#EDF7F8',
                  border: '2px solid #00646B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: '#00646B',
                  fontWeight: 600,
                }}
              >
                radius: 8px (brand)
              </div>
            </div>

            {/* Link */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: '#666', marginBottom: '4px' }}>
                Link Style
              </div>
              <a href="#" onClick={(e) => e.preventDefault()} style={{ color: 'var(--bs-link-color, #00646B)', fontWeight: 600, textDecoration: 'underline' }}>
                Access IPPB Banking Portal →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Side-by-Side Detailed Token Table */}
      <div style={{ border: '1px solid #e0e0e0', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#fff' }}>
        <div style={{ padding: '16px 20px', backgroundColor: '#fafafa', borderBottom: '1px solid #e0e0e0' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#222' }}>
            Detailed CSS Custom Property Differential
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#666' }}>
            Comparison of stock UX4G variable values vs active brand computed values.
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f2f5', borderBottom: '2px solid #ddd', fontSize: '12px', textTransform: 'uppercase', color: '#555' }}>
              <th style={{ padding: '12px 16px' }}>Variable Name</th>
              <th style={{ padding: '12px 16px' }}>UX4G Default Value</th>
              <th style={{ padding: '12px 16px' }}>Brand Resolved Value</th>
              <th style={{ padding: '12px 16px', textAlign: 'center' }}>Override Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(UX4G_DEFAULTS).map((varName) => (
              <TokenComparisonRow
                key={varName}
                varName={varName}
                ux4gVal={UX4G_DEFAULTS[varName]}
                brandVal={computedBrand[varName] || BRAND_DEFAULTS[varName] || UX4G_DEFAULTS[varName]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const meta = {
  title: 'Tokens/Compare',
  component: CompareShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CompareShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

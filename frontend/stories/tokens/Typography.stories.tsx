/**
 * @file    Typography.stories.tsx
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
import type { ElementType } from 'react';
import { useEffect, useRef, useState } from 'react';

interface TypographyRowProps {
  label: string;
  className?: string;
  tag?: ElementType;
  sampleText?: string;
}

function TypographyRow({
  label,
  className = '',
  tag: Tag = 'div',
  sampleText = 'India Post Payments Bank — Fast, Simple, Secure Banking',
}: TypographyRowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [styles, setStyles] = useState({ fontSize: '', fontWeight: '', lineHeight: '' });

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      if (ref.current) {
        const computed = getComputedStyle(ref.current);
        setStyles({
          fontSize: computed.fontSize,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
        });
      }
    });
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div style={{ padding: '16px 0', borderBottom: '1px solid #eee' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '13px',
            fontWeight: 700,
            color: '#00646B',
            background: '#EDF7F8',
            padding: '2px 8px',
            borderRadius: '4px',
          }}
        >
          {label}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '12px', color: '#666' }}>
          size: <strong>{styles.fontSize}</strong> · weight: <strong>{styles.fontWeight}</strong> · line-height:{' '}
          <strong>{styles.lineHeight}</strong>
        </span>
      </div>
      <div ref={ref}>
        <Tag className={className} style={{ margin: 0 }}>
          {sampleText}
        </Tag>
      </div>
    </div>
  );
}

const DISPLAY_SCALES = [
  { label: '.display-1', className: 'display-1' },
  { label: '.display-2', className: 'display-2' },
  { label: '.display-3', className: 'display-3' },
  { label: '.display-4', className: 'display-4' },
  { label: '.display-5', className: 'display-5' },
  { label: '.display-6', className: 'display-6' },
];

const HEADING_TAGS = [
  { label: '<h1>', tag: 'h1' as const },
  { label: '<h2>', tag: 'h2' as const },
  { label: '<h3>', tag: 'h3' as const },
  { label: '<h4>', tag: 'h4' as const },
  { label: '<h5>', tag: 'h5' as const },
  { label: '<h6>', tag: 'h6' as const },
];

const TITLE_SCALES = [
  { label: '.title-1', className: 'title-1' },
  { label: '.title-2', className: 'title-2' },
  { label: '.title-3', className: 'title-3' },
];

const BODY_SCALES = [
  {
    label: '.body-1',
    className: 'body-1',
    sample: 'Body 1: Primary paragraph copy used across main content pages, reading articles, and dashboard views.',
  },
  {
    label: '.body-2',
    className: 'body-2',
    sample: 'Body 2: Standard secondary text used for descriptive subtexts, helper blocks, and list items.',
  },
  {
    label: '.body-3',
    className: 'body-3',
    sample: 'Body 3: Compact body copy suited for dense data tables, meta information, and supplementary footnotes.',
  },
];

const LABEL_SCALES = [
  { label: '.label-1', className: 'label-1', sample: 'Label 1 — Form Section Grouping' },
  { label: '.label-2', className: 'label-2', sample: 'Label 2 — Standard Input Field Label' },
  { label: '.label-3', className: 'label-3', sample: 'Label 3 — Tiny Badge & Caption Label' },
];

function TypographyShowcase() {
  return (
    <div style={{ padding: '24px', fontFamily: 'sans-serif', maxWidth: '1000px' }}>
      <div style={{ marginBottom: '24px', borderBottom: '1px solid #e0e0e0', paddingBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#111' }}>Design Tokens — Typography</h1>
        <p style={{ color: '#555', marginTop: '6px', fontSize: '14px' }}>
          UX4G typographic scale covering Display, Headings, Titles, Body, and Label classes with computed font metrics.
        </p>
      </div>

      {/* Display Section */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222', borderBottom: '2px solid #00646B', paddingBottom: '6px' }}>
          Display Classes
        </h2>
        {DISPLAY_SCALES.map((item) => (
          <TypographyRow key={item.label} label={item.label} className={item.className} />
        ))}
      </section>

      {/* Headings Section */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222', borderBottom: '2px solid #00646B', paddingBottom: '6px' }}>
          Heading Elements (h1–h6)
        </h2>
        {HEADING_TAGS.map((item) => (
          <TypographyRow key={item.label} label={item.label} tag={item.tag} />
        ))}
      </section>

      {/* Titles Section */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222', borderBottom: '2px solid #00646B', paddingBottom: '6px' }}>
          Title Classes
        </h2>
        {TITLE_SCALES.map((item) => (
          <TypographyRow key={item.label} label={item.label} className={item.className} />
        ))}
      </section>

      {/* Body Section */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222', borderBottom: '2px solid #00646B', paddingBottom: '6px' }}>
          Body Classes
        </h2>
        {BODY_SCALES.map((item) => (
          <TypographyRow key={item.label} label={item.label} className={item.className} sampleText={item.sample} />
        ))}
      </section>

      {/* Labels Section */}
      <section style={{ marginBottom: '36px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#222', borderBottom: '2px solid #00646B', paddingBottom: '6px' }}>
          Label Classes
        </h2>
        {LABEL_SCALES.map((item) => (
          <TypographyRow key={item.label} label={item.label} className={item.className} sampleText={item.sample} />
        ))}
      </section>
    </div>
  );
}

const meta = {
  title: 'Tokens/Typography',
  component: TypographyShowcase,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TypographyShowcase>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

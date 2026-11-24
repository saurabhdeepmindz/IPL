/**
 * @file    Tabs.tsx
 * @module  UiComponents
 *
 * @description
 * The UX4G tabs. In plain words: tabs with arrow-key movement, an optional count on each tab and one visible panel.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @epic    EPIC-ADM-01
 * @subtask ST-ADM01-000-FE-03
 */
import { type KeyboardEvent, type ReactNode, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface TabItem {
  /** Stable key of the tab. */
  id: string;
  /** Text on the tab. */
  label: string;
  /** Optional count shown after the label, for example the number of locked users. */
  count?: number;
  /** True to show the tab but not allow it. */
  disabled?: boolean;
  /** What the tab shows when it is selected. */
  panel: ReactNode;
}

interface TabsProps {
  /** The tabs, in order. */
  tabs: TabItem[];
  /** Selected tab (controlled). Leave out to let the component keep it. */
  value?: string;
  /** First selected tab when not controlled. */
  defaultValue?: string;
  /** Called with the id of the tab the user chose. */
  onChange?: (id: string) => void;
  /** Accessible name of the whole tab list. */
  ariaLabel: string;
}

/**
 * Typed React wrapper around the UX4G `.nav-tabs`, with the keyboard behaviour of the ARIA tabs pattern.
 * @see https://www.ux4g.gov.in — Components › Tabs
 */
function Tabs({ tabs, value, defaultValue, onChange, ariaLabel }: TabsProps) {
  const base = useId();
  const [inner, setInner] = useState(defaultValue ?? tabs.find((t) => !t.disabled)?.id ?? '');
  const selected = value ?? inner;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const enabled = tabs.filter((t) => !t.disabled);

  const choose = (id: string) => {
    setInner(id);
    onChange?.(id);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const at = enabled.findIndex((t) => t.id === id);
    const move: Record<string, number> = { ArrowRight: at + 1, ArrowLeft: at - 1, Home: 0, End: enabled.length - 1 };
    if (!(e.key in move)) return;
    e.preventDefault();
    const next = enabled[(move[e.key] + enabled.length) % enabled.length];
    refs.current[next.id]?.focus();
    choose(next.id);
  };

  return (
    <div>
      <ul className="nav nav-tabs" role="tablist" aria-label={ariaLabel}>
        {tabs.map((t) => (
          <li className="nav-item" role="presentation" key={t.id}>
            <button
              ref={(el) => {
                refs.current[t.id] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={selected === t.id}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={selected === t.id ? 0 : -1}
              disabled={t.disabled}
              className={cn('nav-link', selected === t.id && 'active')}
              onClick={() => choose(t.id)}
              onKeyDown={(e) => onKeyDown(e, t.id)}
            >
              {t.label}
              {t.count !== undefined && <span className="badge text-bg-secondary ms-2">{t.count}</span>}
            </button>
          </li>
        ))}
      </ul>
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`${base}-panel-${t.id}`}
          aria-labelledby={`${base}-tab-${t.id}`}
          hidden={selected !== t.id}
          className="pt-3"
        >
          {selected === t.id && t.panel}
        </div>
      ))}
    </div>
  );
}

export { Tabs, type TabsProps, type TabItem };

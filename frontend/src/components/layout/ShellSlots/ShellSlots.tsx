/**
 * @file    ShellSlots.tsx
 * @module  Layout
 *
 * @description
 * Shell slots. In plain words: lets the page layout hand the shell a piece that belongs to a feature (the company box), so the shell imports no feature.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R18-S36
 * @status  built
 */
'use client';

import { createContext, useContext, type ReactNode } from 'react';

/** The pieces of the shell that a feature supplies. */
interface ShellSlots {
  /** The company and financial year box of the top bar */
  companySwitcher?: ReactNode;
}

const ShellSlotsContext = createContext<ShellSlots>({});

/** Gives the shell below it its slots. */
export function ShellSlotsProvider({ companySwitcher, children }: ShellSlots & { children: ReactNode }) {
  return <ShellSlotsContext.Provider value={{ companySwitcher }}>{children}</ShellSlotsContext.Provider>;
}

/** The slots of the nearest provider (none when there is no provider). */
export function useShellSlots(): ShellSlots {
  return useContext(ShellSlotsContext);
}

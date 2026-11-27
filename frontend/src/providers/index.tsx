/**
 * @file    index.tsx
 * @module  Providers
 *
 * @description
 * Root providers: theme and data fetching. In plain words: wraps every page once.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
'use client';

import { type ReactNode } from 'react';
import { ThemeProvider } from 'next-themes';
import { MustChangeRedirect } from '@/features/auth/components/MustChangeRedirect';
import { QueryProvider } from '@/providers/QueryProvider';

interface AppProvidersProps {
  children: ReactNode;
}

/**
 * Combined root providers wrapper.
 * Add any new global providers here — keeps layout.tsx clean.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider
      attribute="data-bs-theme"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <MustChangeRedirect />
        {children}
      </QueryProvider>
    </ThemeProvider>
  );
}

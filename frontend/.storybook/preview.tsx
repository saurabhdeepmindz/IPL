import type { Preview } from '@storybook/nextjs-vite';
import type { Decorator } from '@storybook/react';
import React from 'react';

/*
 * CSS Load Order — matches the app (app/layout.tsx + globals.css):
 *   1. UX4G CSS (CDN) — loaded below
 *   2. brand-tokens.css — design token overrides scoped to [data-theme="brand"]
 *   3. globals.css — Tailwind v4 theme + utilities + app custom styles
 */
import '../src/styles/brand-tokens.css';
import '../src/app/globals.css';

/**
 * Inner wrapper component so React hooks rules-of-hooks are satisfied.
 */
function ThemeWrapper({ theme, children }: { theme: string; children: React.ReactNode }) {
  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => {
      document.documentElement.removeAttribute('data-theme');
    };
  }, [theme]);
  return <>{children}</>;
}

/**
 * Theme switcher decorator — sets `data-theme` on <html> so the brand-token
 * CSS variable overrides activate or deactivate.
 */
const withTheme: Decorator = (Story, context) => {
  const theme = (context.globals.theme as string) || 'brand';
  return (
    <ThemeWrapper theme={theme}>
      <Story />
    </ThemeWrapper>
  );
};

const preview: Preview = {
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Toggle between UX4G default and Brand tokens',
      defaultValue: 'brand',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          { value: 'brand', title: 'Brand tokens', icon: 'star' },
          { value: 'ux4g', title: 'UX4G default', icon: 'component' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
};

export default preview;

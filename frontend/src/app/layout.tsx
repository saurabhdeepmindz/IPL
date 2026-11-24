/**
 * @file    layout.tsx
 * @module  App
 *
 * @description
 * Root layout: fonts, UX4G styles, providers. In plain words: the frame around every page.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Noto_Sans } from 'next/font/google';
import { AppProviders } from '@/providers';
import { APP_CONFIG } from '@/constants/config';
import { UX4G_ASSETS } from '@/constants/ux4g';
import './globals.css';
// Keep brand overrides unlayered so the external UX4G defaults cannot override them.
import '@/styles/brand-tokens.css';

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin', 'devanagari'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.name,
    template: `%s | ${APP_CONFIG.name}`,
  },
  description: 'Approval Management System.',
  metadataBase: new URL(APP_CONFIG.url),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" data-theme="brand" className={notoSans.variable} suppressHydrationWarning>
      <head>
        {/* UX4G component styles — must load before app CSS */}
        <link rel="stylesheet" href={UX4G_ASSETS.css} precedence="default" />
      </head>
      <body className="d-flex flex-column min-vh-100">
        <a href="#main-content" className="skip-link btn btn-primary">
          Skip to main content
        </a>
        <AppProviders>{children}</AppProviders>
        {/* UX4G JS (dropdowns, modals, tooltips, offcanvas) */}
        <Script src={UX4G_ASSETS.js} strategy="afterInteractive" />
      </body>
    </html>
  );
}

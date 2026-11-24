/**
 * @file    ux4g.ts
 * @module  Constants
 *
 * @description
 * Addresses of the UX4G design-system files. In plain words: where the shared look comes from.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-25
 *
 * @subtask ST-ADM01-000-FE-01
 */
/**
 * UX4G design system assets (https://www.ux4g.gov.in).
 * UX4G is distributed via the official CDN; bump the version here only.
 */
export const UX4G_VERSION = '2.0.8';

const UX4G_CDN = `https://cdn.ux4g.gov.in/UX4G@${UX4G_VERSION}`;

export const UX4G_ASSETS = {
  css: `${UX4G_CDN}/css/ux4g-min.css`,
  js: `${UX4G_CDN}/js/ux4g.bundle.min.js`,
} as const;

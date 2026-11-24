/**
 * Design Token Mappings — Brand Tokens to Bootstrap / UX4G CSS Variables
 *
 * Context & Architecture:
 * - Brand Primary: #00646B (Deep Teal), replaces UX4G's default purple (#613AF5).
 * - Brand Secondary: #F2B705 (Vibrant Gold), replaces UX4G's default secondary (#938BB6).
 * - Root variables (--bs-primary, --bs-secondary, etc.) are declared on `:root[data-theme="brand"]`.
 * - UX4G components (such as .btn-primary) and tonal utility classes (.bg-primary-50, etc.)
 *   hardcode styles with `!important`, necessitating scoped selector overrides.
 */

// ============================================================================
// 1. Root Variable Mapping
// ============================================================================

/**
 * Maps brand token JSON dot-paths to Bootstrap / UX4G `:root` CSS variables.
 * Includes aliases for Source/Default token representations.
 */
export const ROOT_VAR_MAP: Record<string, string> = {
  'colors.Primary.600': '--bs-primary',
  'colors.Primary.Source': '--bs-primary', // alias
  'colors.Secondary.400': '--bs-secondary',
  'colors.Secondary.Default: Secondary': '--bs-secondary', // alias
  'colors.Success.Default': '--bs-success',
  'colors.Danger.Default': '--bs-danger',
  'colors.Warning.Default': '--bs-warning',
  'colors.Text.Dark': '--bs-body-color',
  'colors.Text.Light': '--bs-white',
  'colors.Neutral.Default': '--bs-dark',
  'borderRadius.radius-md': '--bs-border-radius',
  'borderRadius.radius-sm': '--bs-border-radius-sm',
  'borderRadius.radius-lg': '--bs-border-radius-lg',
  'borderRadius.radius-xl': '--bs-border-radius-xl',
  'borderRadius.radius-2xl': '--bs-border-radius-2xl',
  'borderRadius.radius-full': '--bs-border-radius-pill',
};

// ============================================================================
// 2. Color Conversion Utility
// ============================================================================

/**
 * Converts a hex color string (#RGB, #RRGGBB, or #RRGGBBAA) to a comma-separated
 * "R, G, B" string triplet for CSS custom properties (e.g. `rgba(var(--bs-primary-rgb), 0.5)`).
 */
export function hexToRgb(hex: string): string {
  let cleaned = hex.trim().replace(/^#/, '');

  if (cleaned.length === 3) {
    cleaned = cleaned
      .split('')
      .map((char) => char + char)
      .join('');
  }

  // Strip alpha channel if present (8 hex digits)
  if (cleaned.length === 8) {
    cleaned = cleaned.slice(0, 6);
  }

  const num = parseInt(cleaned, 16);
  if (Number.isNaN(num) || cleaned.length < 6) {
    throw new Error(`Invalid hex color string: "${hex}"`);
  }

  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;

  return `${r}, ${g}, ${b}`;
}

// ============================================================================
// 3. RGB Variable Pairs
// ============================================================================

/**
 * Maps root color variables to their corresponding `-rgb` variant variables,
 * which Bootstrap and UX4G use for alpha transparency calculations.
 */
export const RGB_VAR_PAIRS: Record<string, string> = {
  '--bs-primary': '--bs-primary-rgb',
  '--bs-secondary': '--bs-secondary-rgb',
  '--bs-success': '--bs-success-rgb',
  '--bs-danger': '--bs-danger-rgb',
  '--bs-warning': '--bs-warning-rgb',
  '--bs-dark': '--bs-dark-rgb',
};

// ============================================================================
// 4. Tonal Shade Utility Mapping
// ============================================================================

export interface TonalMapping {
  selectors: string[]; // e.g. ['.bg-primary-50', '.text-primary-50', '.border-primary-50']
  properties: string[]; // e.g. ['background-color', 'color', 'border-color']
}

const TONAL_SHADES = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'] as const;

interface TonalCategoryConfig {
  tokenGroup: string; // Token group key under colors.* in brand.json
  classPrefix: string; // CSS utility class prefix
}

const TONAL_CATEGORIES: TonalCategoryConfig[] = [
  { tokenGroup: 'Primary', classPrefix: 'primary' },
  { tokenGroup: 'Secondary', classPrefix: 'secondary' },
  { tokenGroup: 'Success', classPrefix: 'success' },
  { tokenGroup: 'Danger', classPrefix: 'danger' },
  { tokenGroup: 'Warning', classPrefix: 'warning' },
  { tokenGroup: 'Neutral', classPrefix: 'gray' },
];

/**
 * Maps brand tonal shades (50-900) across all color categories to UX4G utility selectors.
 * For neutral/gray, tokens in `colors.Neutral.*` map to `.bg-gray-*`, `.text-gray-*`, etc.
 */
export const TONAL_SHADE_MAP: Record<string, TonalMapping> = {};

for (const { tokenGroup, classPrefix } of TONAL_CATEGORIES) {
  for (const shade of TONAL_SHADES) {
    const tokenPath = `colors.${tokenGroup}.${shade}`;
    TONAL_SHADE_MAP[tokenPath] = {
      selectors: [
        `.bg-${classPrefix}-${shade}`,
        `.text-${classPrefix}-${shade}`,
        `.border-${classPrefix}-${shade}`,
      ],
      properties: ['background-color', 'color', 'border-color'],
    };
  }
}

// ============================================================================
// 5. Component Override Mapping
// ============================================================================

export interface ComponentOverride {
  selector: string;
  vars: Record<string, string>; // CSS var name → token path or computed marker
}

/**
 * Component variant classes that require selector overrides because UX4G
 * bundles hardcoded styles with `!important`.
 *
 * Uses special `__computed_*__` markers for values dynamically computed by the build script:
 * - `__computed_focus_shadow_<category>__`: Focus ring box-shadow
 * - `__computed_active_<category>__`: Active state background color
 */
export const COMPONENT_OVERRIDE_MAP: Record<string, ComponentOverride> = {
  // --- Primary Button Overrides ---
  '.btn-primary': {
    selector: '.btn-primary',
    vars: {
      '--bs-btn-bg': 'colors.Primary.600', // #00646B
      '--bs-btn-border-color': 'colors.Primary.600',
      '--bs-btn-hover-bg': 'colors.Primary.700', // #005257
      '--bs-btn-hover-border-color': 'colors.Primary.700',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_primary__',
      '--bs-btn-active-bg': '__computed_active_primary__',
      '--bs-btn-active-border-color': '__computed_active_primary__',
      '--bs-btn-disabled-bg': 'colors.Primary.200', // #ABE0E3
      '--bs-btn-disabled-border-color': 'colors.Primary.200',
    },
  },
  '.btn-primary-tonal': {
    selector: '.btn-primary-tonal',
    vars: {
      '--bs-btn-color': 'colors.Primary.700',
      '--bs-btn-bg': 'colors.Primary.100',
      '--bs-btn-border-color': 'colors.Primary.100',
      '--bs-btn-hover-color': 'colors.Primary.800',
      '--bs-btn-hover-bg': 'colors.Primary.200',
      '--bs-btn-hover-border-color': 'colors.Primary.200',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_primary__',
      '--bs-btn-active-color': 'colors.Primary.900',
      '--bs-btn-active-bg': 'colors.Primary.300',
      '--bs-btn-active-border-color': 'colors.Primary.300',
      '--bs-btn-disabled-color': 'colors.Primary.300',
      '--bs-btn-disabled-bg': 'colors.Primary.50',
      '--bs-btn-disabled-border-color': 'colors.Primary.50',
    },
  },
  '.btn-outline-primary': {
    selector: '.btn-outline-primary',
    vars: {
      '--bs-btn-color': 'colors.Primary.600',
      '--bs-btn-border-color': 'colors.Primary.600',
      '--bs-btn-hover-color': 'colors.Text.Light',
      '--bs-btn-hover-bg': 'colors.Primary.600',
      '--bs-btn-hover-border-color': 'colors.Primary.600',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_primary__',
      '--bs-btn-active-color': 'colors.Text.Light',
      '--bs-btn-active-bg': 'colors.Primary.700',
      '--bs-btn-active-border-color': 'colors.Primary.700',
      '--bs-btn-disabled-color': 'colors.Primary.200',
      '--bs-btn-disabled-border-color': 'colors.Primary.200',
    },
  },
  '.alert-primary': {
    selector: '.alert-primary',
    vars: {
      '--bs-alert-color': 'colors.Primary.900',
      '--bs-alert-bg': 'colors.Primary.50',
      '--bs-alert-border-color': 'colors.Primary.200',
    },
  },

  // --- Secondary Button Overrides ---
  '.btn-secondary': {
    selector: '.btn-secondary',
    vars: {
      '--bs-btn-bg': 'colors.Secondary.400', // #F2B705
      '--bs-btn-border-color': 'colors.Secondary.400',
      '--bs-btn-hover-bg': 'colors.Secondary.500', // #BE8C04
      '--bs-btn-hover-border-color': 'colors.Secondary.500',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_secondary__',
      '--bs-btn-active-bg': '__computed_active_secondary__',
      '--bs-btn-active-border-color': '__computed_active_secondary__',
      '--bs-btn-disabled-bg': 'colors.Secondary.200', // #FFE18F
      '--bs-btn-disabled-border-color': 'colors.Secondary.200',
    },
  },
  '.btn-secondary-tonal': {
    selector: '.btn-secondary-tonal',
    vars: {
      '--bs-btn-color': 'colors.Secondary.800',
      '--bs-btn-bg': 'colors.Secondary.100',
      '--bs-btn-border-color': 'colors.Secondary.100',
      '--bs-btn-hover-color': 'colors.Secondary.900',
      '--bs-btn-hover-bg': 'colors.Secondary.200',
      '--bs-btn-hover-border-color': 'colors.Secondary.200',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_secondary__',
      '--bs-btn-active-color': 'colors.Secondary.900',
      '--bs-btn-active-bg': 'colors.Secondary.300',
      '--bs-btn-active-border-color': 'colors.Secondary.300',
      '--bs-btn-disabled-color': 'colors.Secondary.300',
      '--bs-btn-disabled-bg': 'colors.Secondary.50',
      '--bs-btn-disabled-border-color': 'colors.Secondary.50',
    },
  },
  '.btn-outline-secondary': {
    selector: '.btn-outline-secondary',
    vars: {
      '--bs-btn-color': 'colors.Secondary.600',
      '--bs-btn-border-color': 'colors.Secondary.400',
      '--bs-btn-hover-color': 'colors.Text.Light',
      '--bs-btn-hover-bg': 'colors.Secondary.400',
      '--bs-btn-hover-border-color': 'colors.Secondary.400',
      '--bs-btn-focus-shadow-rgb': '__computed_focus_shadow_secondary__',
      '--bs-btn-active-color': 'colors.Text.Light',
      '--bs-btn-active-bg': 'colors.Secondary.500',
      '--bs-btn-active-border-color': 'colors.Secondary.500',
      '--bs-btn-disabled-color': 'colors.Secondary.200',
      '--bs-btn-disabled-border-color': 'colors.Secondary.200',
    },
  },
  '.alert-secondary': {
    selector: '.alert-secondary',
    vars: {
      '--bs-alert-color': 'colors.Secondary.900',
      '--bs-alert-bg': 'colors.Secondary.50',
      '--bs-alert-border-color': 'colors.Secondary.200',
    },
  },

  // --- Feedback Alert Overrides ---
  '.alert-success': {
    selector: '.alert-success',
    vars: {
      '--bs-alert-color': 'colors.Success.900',
      '--bs-alert-bg': 'colors.Success.50',
      '--bs-alert-border-color': 'colors.Success.200',
    },
  },
  '.alert-danger': {
    selector: '.alert-danger',
    vars: {
      '--bs-alert-color': 'colors.Danger.900',
      '--bs-alert-bg': 'colors.Danger.50',
      '--bs-alert-border-color': 'colors.Danger.200',
    },
  },
  '.alert-warning': {
    selector: '.alert-warning',
    vars: {
      '--bs-alert-color': 'colors.Warning.900',
      '--bs-alert-bg': 'colors.Warning.50',
      '--bs-alert-border-color': 'colors.Warning.200',
    },
  },
};

// ============================================================================
// 6. Link Overrides
// ============================================================================

/**
 * Maps Bootstrap link color variables to brand primary palette tokens.
 */
export const LINK_OVERRIDES: Record<string, string> = {
  '--bs-link-color': 'colors.Primary.600',
  '--bs-link-hover-color': 'colors.Primary.500',
};

// ============================================================================
// 7. Brand Spacing Mapping
// ============================================================================

/**
 * Maps all 15 brand spacing tokens to custom CSS custom properties (--brand-spacing-*).
 * Bootstrap does not provide spacing CSS variables in :root, so these are exposed
 * directly for component and layout use.
 */
export const BRAND_SPACING_MAP: Record<string, string> = {
  'spacing.spacing-none': '--brand-spacing-none',
  'spacing.spacing-xxs': '--brand-spacing-xxs',
  'spacing.spacing-xs': '--brand-spacing-xs',
  'spacing.spacing-sm': '--brand-spacing-sm',
  'spacing.spacing-md': '--brand-spacing-md',
  'spacing.spacing-lg': '--brand-spacing-lg',
  'spacing.spacing-xl': '--brand-spacing-xl',
  'spacing.spacing-2xl': '--brand-spacing-2xl',
  'spacing.spacing-3xl': '--brand-spacing-3xl',
  'spacing.spacing-4xl': '--brand-spacing-4xl',
  'spacing.spacing-5xl': '--brand-spacing-5xl',
  'spacing.spacing-6xl': '--brand-spacing-6xl',
  'spacing.spacing-7xl': '--brand-spacing-7xl',
  'spacing.spacing-8xl': '--brand-spacing-8xl',
  'spacing.spacing-9xl': '--brand-spacing-9xl',
};

// ============================================================================
// 8. Brand Shadow Mapping
// ============================================================================

/**
 * Maps all 6 brand shadow tokens to custom CSS custom properties (--brand-shadow-*).
 * The build script converts Tokens Studio shadow definitions into CSS box-shadow values.
 */
export const BRAND_SHADOW_MAP: Record<string, string> = {
  'colors.Shadows.shadow-xs': '--brand-shadow-xs',
  'colors.Shadows.shadow-s': '--brand-shadow-s',
  'colors.Shadows.shadow-md': '--brand-shadow-md',
  'colors.Shadows.shadow-lg': '--brand-shadow-lg',
  'colors.Shadows.shadow-xl': '--brand-shadow-xl',
  'colors.Shadows.shadow-2xl': '--brand-shadow-2xl',
};

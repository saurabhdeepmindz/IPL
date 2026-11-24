/**
 * Build Script — Compiles Design Tokens to CSS Custom Properties
 *
 * Source: tokens/brand.json
 * Output: src/styles/brand-tokens.css
 * Usage:  npx tsx scripts/build-tokens.ts
 */

import fs from 'node:fs';
import path from 'node:path';
import {
  ROOT_VAR_MAP,
  RGB_VAR_PAIRS,
  TONAL_SHADE_MAP,
  COMPONENT_OVERRIDE_MAP,
  LINK_OVERRIDES,
  BRAND_SPACING_MAP,
  BRAND_SHADOW_MAP,
  hexToRgb,
} from '../tokens/mapping';

// Determine project root directory safely across ESM and CJS
const scriptDir = typeof __dirname !== 'undefined'
  ? __dirname
  : path.dirname(new URL(import.meta.url).pathname);
const projectRoot = path.resolve(scriptDir, '..');

const TOKENS_PATH = path.join(projectRoot, 'tokens', 'brand.json');
const OUTPUT_PATH = path.join(projectRoot, 'src', 'styles', 'brand-tokens.css');

interface ShadowTokenObject {
  color: string;
  type?: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
}

/**
 * Resolves a dot-separated token path within brand.json.
 * Automatically unwraps Tokens Studio `{ value: ... }` containers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveTokenValue(brand: Record<string, any>, tokenPath: string): any {
  const parts = tokenPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = brand;
  for (const part of parts) {
    if (current === null || current === undefined || !(part in current)) {
      throw new Error(`Token path not found: "${tokenPath}" (missing segment "${part}")`);
    }
    current = current[part];
  }
  if (current !== null && typeof current === 'object' && 'value' in current) {
    return current.value;
  }
  return current;
}

/**
 * Formats a Tokens Studio box-shadow object into CSS box-shadow syntax.
 */
function formatSingleShadow(shadow: ShadowTokenObject): string {
  const inset = shadow.type === 'innerShadow' ? 'inset ' : '';
  return `${inset}${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}

/**
 * Formats single or multi-layer box shadows.
 */
function formatShadowValue(val: unknown): string {
  if (Array.isArray(val)) {
    return (val as ShadowTokenObject[]).map(formatSingleShadow).join(', ');
  }
  if (typeof val === 'object' && val !== null && 'x' in val) {
    return formatSingleShadow(val as ShadowTokenObject);
  }
  return String(val);
}

/**
 * Primary token paths for color categories used in computed markers.
 */
const CATEGORY_TOKEN_MAP: Record<string, string> = {
  primary: 'colors.Primary.600',
  secondary: 'colors.Secondary.400',
  success: 'colors.Success.Default',
  danger: 'colors.Danger.Default',
  warning: 'colors.Warning.Default',
};

/**
 * Resolves either a special __computed_*__ marker or a standard token path.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveComputedOrToken(brand: Record<string, any>, val: string): string {
  const focusMatch = val.match(/^__computed_focus_shadow_([a-zA-Z0-9_-]+)__$/);
  if (focusMatch) {
    const category = focusMatch[1].toLowerCase();
    const tokenPath = CATEGORY_TOKEN_MAP[category];
    if (!tokenPath) {
      throw new Error(`Unknown category in computed focus shadow marker: "${val}"`);
    }
    const hex = resolveTokenValue(brand, tokenPath);
    const rgb = hexToRgb(hex);
    return `0px 0px 0px 4px rgba(${rgb}, 0.50)`;
  }

  const activeMatch = val.match(/^__computed_active_([a-zA-Z0-9_-]+)__$/);
  if (activeMatch) {
    const category = activeMatch[1].toLowerCase();
    const tokenPath = CATEGORY_TOKEN_MAP[category];
    if (!tokenPath) {
      throw new Error(`Unknown category in computed active marker: "${val}"`);
    }
    const hex = resolveTokenValue(brand, tokenPath);
    const rgb = hexToRgb(hex);
    return `rgba(${rgb}, 0.9)`;
  }

  const resolved = resolveTokenValue(brand, val);
  if (typeof resolved === 'number') {
    return `${resolved}px`;
  }
  return String(resolved);
}

function buildTokens(): void {
  console.warn(`[build-tokens] Reading tokens from: ${TOKENS_PATH}`);
  if (!fs.existsSync(TOKENS_PATH)) {
    throw new Error(`Token file not found: ${TOKENS_PATH}`);
  }

  const brand = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf-8')) as Record<string, unknown>;
  const timestamp = new Date().toISOString();

  let rootVarCount = 0;
  let componentVarCount = 0;
  let tonalRuleCount = 0;

  // Header Banner
  const output: string[] = [
    '/* ============================================================',
    ' * Brand Design Tokens — AUTO-GENERATED',
    ' * Source: tokens/brand.json',
    ` * Generated: ${timestamp}`,
    ' * DO NOT EDIT — run `npm run tokens:build` to regenerate.',
    ' * ============================================================ */',
    '',
    '/* === Global CSS Variable Overrides === */',
    ':root[data-theme="brand"] {',
  ];

  // 1. Root Colors
  output.push('  /* Colors */');
  const emittedColors = new Set<string>();
  for (const [tokenPath, varName] of Object.entries(ROOT_VAR_MAP)) {
    if (!tokenPath.startsWith('colors.')) continue;
    if (emittedColors.has(varName)) continue;
    emittedColors.add(varName);

    const val = resolveTokenValue(brand, tokenPath);
    output.push(`  ${varName}: ${val};`);
    rootVarCount++;

    if (varName in RGB_VAR_PAIRS) {
      const rgbVar = RGB_VAR_PAIRS[varName];
      output.push(`  ${rgbVar}: ${hexToRgb(val)};`);
      rootVarCount++;
    }
  }

  // 2. Links
  output.push('');
  output.push('  /* Links */');
  for (const [varName, tokenPath] of Object.entries(LINK_OVERRIDES)) {
    const val = resolveTokenValue(brand, tokenPath);
    output.push(`  ${varName}: ${val};`);
    rootVarCount++;
  }

  // 3. Border Radius
  output.push('');
  output.push('  /* Border Radius */');
  const emittedRadius = new Set<string>();
  for (const [tokenPath, varName] of Object.entries(ROOT_VAR_MAP)) {
    if (!tokenPath.startsWith('borderRadius.')) continue;
    if (emittedRadius.has(varName)) continue;
    emittedRadius.add(varName);

    const val = resolveTokenValue(brand, tokenPath);
    const formatted = typeof val === 'number' ? `${val}px` : val;
    output.push(`  ${varName}: ${formatted};`);
    rootVarCount++;
  }

  // 4. Brand Spacing
  output.push('');
  output.push('  /* Brand Spacing (custom vars) */');
  for (const [tokenPath, varName] of Object.entries(BRAND_SPACING_MAP)) {
    const val = resolveTokenValue(brand, tokenPath);
    const formatted = typeof val === 'number' ? `${val}px` : val;
    output.push(`  ${varName}: ${formatted};`);
    rootVarCount++;
  }

  // 5. Brand Shadows
  output.push('');
  output.push('  /* Brand Shadows (custom vars) */');
  for (const [tokenPath, varName] of Object.entries(BRAND_SHADOW_MAP)) {
    const val = resolveTokenValue(brand, tokenPath);
    const formatted = formatShadowValue(val);
    output.push(`  ${varName}: ${formatted};`);
    rootVarCount++;
  }

  output.push('}');
  output.push('');

  // Section 2: Component Overrides
  output.push('/* === Component Selector Overrides === */');
  for (const override of Object.values(COMPONENT_OVERRIDE_MAP)) {
    output.push(`:root[data-theme="brand"] ${override.selector} {`);
    for (const [varName, tokenPathOrMarker] of Object.entries(override.vars)) {
      const resolved = resolveComputedOrToken(brand, tokenPathOrMarker);
      const isFocusShadowRgb = varName === '--bs-btn-focus-shadow-rgb';
      const suffix = isFocusShadowRgb ? ';' : ' !important;';
      output.push(`  ${varName}: ${resolved}${suffix}`);
      componentVarCount++;
    }
    output.push('}');
    output.push('');
  }

  // Section 3: Tonal Utility Overrides
  output.push('/* === Tonal Utility Class Overrides === */');
  for (const [tokenPath, mapping] of Object.entries(TONAL_SHADE_MAP)) {
    const color = resolveTokenValue(brand, tokenPath);
    for (let i = 0; i < mapping.selectors.length; i++) {
      const selector = mapping.selectors[i];
      const property = mapping.properties[i];
      output.push(`:root[data-theme="brand"] ${selector} { ${property}: ${color} !important; }`);
      tonalRuleCount++;
    }
  }
  output.push('');

  const outputContent = output.join('\n');

  // Ensure target directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, outputContent, 'utf-8');

  console.warn(`[build-tokens] Generated CSS successfully!`);
  console.warn(`[build-tokens] Output written to: ${OUTPUT_PATH}`);
  console.warn('[build-tokens] Summary:');
  console.warn(`  - Root CSS variables:        ${rootVarCount}`);
  console.warn(`  - Component override vars:   ${componentVarCount} across ${Object.keys(COMPONENT_OVERRIDE_MAP).length} selectors`);
  console.warn(`  - Tonal utility class rules: ${tonalRuleCount}`);
  console.warn(`  - Total lines generated:     ${output.length}`);
}

buildTokens();

/**
 * @file    check-structure.d.mts
 * @module  Tooling
 *
 * @description
 * Types of the structure checker. In plain words: lets the tests of the checker be type-checked.
 *
 * @author  Deepmindz AMS team
 * @version 0.1.0
 * @since   2026-11-28
 *
 * @subtask ST-R16-PS33
 * @status  built
 */
export interface StructureConfig {
  featureDirs: string[];
  componentAreas: string[];
  appMayImport: string[];
  lowLayers: string[];
  g4?: string[];
  ignoreFiles?: string[];
}
export interface AllowEntry {
  rule: string;
  key: string;
  owner?: string;
  reason?: string;
}
export interface Finding {
  rule: string;
  key: string;
  file: string;
  message: string;
}
export function checkStructure(args: { root: string; config: StructureConfig; allowlist?: AllowEntry[] }): {
  violations: Finding[];
  warnings: { rule: string; key: string; message: string }[];
  allowed: (Finding & { owner?: string; reason?: string })[];
  stale: AllowEntry[];
};

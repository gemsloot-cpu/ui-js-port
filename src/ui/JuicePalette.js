/**
 * JuicePalette - Standardized Color Palette and Design Tokens
 * Ported from Godot 4 UI Theme & Juice Palette
 */
export const JuicePalette = {
  // Background & Surfaces
  background: 0x0f0f1b,
  backgroundHex: '#0f0f1b',
  surface: 0x1a1a2e,
  surfaceHex: '#1a1a2e',
  surfaceLight: 0x22223b,
  surfaceLightHex: '#22223b',
  surfaceBorder: 0x3d3d5c,
  surfaceBorderHex: '#3d3d5c',

  // Brand / Theme Accents
  primary: 0xe94560,
  primaryHex: '#e94560',
  primaryDark: 0xb82e45,
  primaryLight: 0xff6b81,

  secondary: 0x4361ee,
  secondaryHex: '#4361ee',
  secondaryDark: 0x2b42b5,
  secondaryLight: 0x7088ff,

  accent: 0xf7b731,
  accentHex: '#f7b731',
  accentDark: 0xc48c18,
  accentLight: 0xffd166,

  // Status & Feedback Colors
  success: 0x06d6a0,
  successHex: '#06d6a0',
  warning: 0xf39c12,
  warningHex: '#f39c12',
  danger: 0xef476f,
  dangerHex: '#ef476f',
  info: 0x4cc9f0,
  infoHex: '#4cc9f0',

  // Progress Bar Fills
  healthFill: 0x06d6a0,
  manaFill: 0x4361ee,
  shieldFill: 0x4cc9f0,
  energyFill: 0xf7b731,
  ghostFill: 0xffffff,
  barTrack: 0x12121f,

  // Text Colors
  textLight: 0xffffff,
  textLightHex: '#ffffff',
  textDim: 0xa4b0be,
  textDimHex: '#a4b0be',
  textDark: 0x1e272e,
  textDarkHex: '#1e272e',

  // Helpers
  toHex: (colorNum) => '#' + colorNum.toString(16).padStart(6, '0'),
  hexToNum: (hexStr) => parseInt(hexStr.replace('#', ''), 16)
};

export default JuicePalette;

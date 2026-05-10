/**
 * Mandatomat color tokens.
 *
 * Source: knowledge base chunk D01_tozsamosc_kolory.
 *
 * Proporcje docelowe na ekranie: 72% neutrals (iron) / 18% primary (precision blue) /
 * 7% przestrzeń / 3% akcent. Volt Green = success only. Signal Red = danger only.
 */

export const precisionBlue = {
  50: '#EFF6FF',
  100: '#DBEAFE',
  200: '#BFDBFE',
  300: '#93C5FD',
  400: '#60A5FA',
  500: '#3B82F6', // hover
  600: '#2563EB', // PRIMARY — buttony, linki, focus ring
  700: '#1D4ED8',
  800: '#1E40AF',
  900: '#1E3A5F',
  950: '#172554',
} as const

export const iron = {
  50: '#FAFAFA',
  100: '#F4F4F5',
  200: '#E4E4E7',
  300: '#D4D4D8',
  400: '#A1A1AA',
  500: '#71717A',
  600: '#52525B',
  700: '#3F3F46',
  800: '#27272A',
  900: '#18181B',
  950: '#09090B',
} as const

export const volt = {
  50: '#F0FDF4',
  100: '#DCFCE7',
  300: '#86EFAC',
  400: '#4ADE80',
  500: '#22C55E',
  600: '#16A34A',
  700: '#15803D',
} as const

export const signal = {
  50: '#FEF2F2',
  100: '#FEE2E2',
  400: '#F87171',
  500: '#EF4444',
  600: '#DC2626',
  700: '#B91C1C',
} as const

export const statusAmber = {
  100: '#FEF3C7',
  500: '#F59E0B',
  600: '#D97706',
} as const

export const semantic = {
  success: volt[600],
  successLight: volt[100],
  warning: statusAmber[600],
  warningLight: statusAmber[100],
  danger: signal[600],
  dangerLight: signal[100],
  info: precisionBlue[600],
  infoLight: precisionBlue[100],
} as const

export const colorTokens = {
  precisionBlue,
  iron,
  volt,
  signal,
  statusAmber,
  semantic,
} as const

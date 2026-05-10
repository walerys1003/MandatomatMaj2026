import type { Config } from 'tailwindcss'

// eslint-disable-next-line @typescript-eslint/no-require-imports
const preset = require('@mandatomat/ui/tailwind-preset')

const config: Config = {
  presets: [preset],
  content: [
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  plugins: [],
}

export default config

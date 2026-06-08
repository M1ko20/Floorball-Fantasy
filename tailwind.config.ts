import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: [
          'JetBrains Mono',
          'IBM Plex Mono',
          'Courier New',
          'monospace',
        ],
      },
      colors: {
        zinc: {
          950: '#09090b',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'selector',
}
export default config

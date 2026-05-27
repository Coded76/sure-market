import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0c10',
          2: '#10131a',
          3: '#161b26',
          4: '#1e2535',
        },
        accent: {
          DEFAULT: '#00d4ff',
          purple: '#7c3aed',
          green: '#10b981',
        },
        border: {
          DEFAULT: 'rgba(255,255,255,0.06)',
          2: 'rgba(255,255,255,0.10)',
        },
      },
      fontFamily: {
        sans: ['var(--font-sora)', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config

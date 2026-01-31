import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'war': {
          'bg': '#0a1a0a',
          'panel': '#0d1f0d',
          'border': '#1a3a1a',
          'glow': '#2d5a2d',
          'text': '#c4d4a0',
          'muted': '#6b7a4f',
          'accent': '#d4a855',
          'bronze': '#cd7f32',
          'gold': '#ffd700',
          'amber': '#f0a500',
          'red': '#cc3333',
          'blue': '#4488cc',
          'green': '#44cc44',
        }
      },
      fontFamily: {
        'mono': ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
        'display': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-in-delay-1': 'fadeIn 0.8s ease-out 0.1s forwards',
        'fade-in-delay-2': 'fadeIn 0.8s ease-out 0.2s forwards',
        'fade-in-delay-3': 'fadeIn 0.8s ease-out 0.3s forwards',
        'fade-in-delay-4': 'fadeIn 0.8s ease-out 0.4s forwards',
        'fade-in-delay-5': 'fadeIn 0.8s ease-out 0.5s forwards',
        'pulse-glow': 'pulseGlow 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(45, 90, 45, 0.3), inset 0 0 5px rgba(45, 90, 45, 0.1)' },
          '50%': { boxShadow: '0 0 15px rgba(45, 90, 45, 0.5), inset 0 0 10px rgba(45, 90, 45, 0.2)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
}

export default config

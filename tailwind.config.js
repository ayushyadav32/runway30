/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Space Grotesk"', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        background: '#07090e',
        surface: {
          DEFAULT: '#0d111a',
          lighter: '#131926',
          border: 'rgba(255, 255, 255, 0.08)',
          hover: '#192132',
        },
        neon: {
          emerald: '#00F59B',
          cyan: '#00F0FF',
          violet: '#8B5CF6',
          purple: '#A855F7',
          rose: '#FF2A6D',
          amber: '#FFB800',
        }
      },
      boxShadow: {
        'glow-emerald': '0 0 25px -5px rgba(0, 245, 155, 0.3)',
        'glow-cyan': '0 0 25px -5px rgba(0, 240, 255, 0.3)',
        'glow-violet': '0 0 25px -5px rgba(139, 92, 246, 0.3)',
        'glow-rose': '0 0 25px -5px rgba(255, 42, 109, 0.35)',
        'glow-amber': '0 0 25px -5px rgba(255, 184, 0, 0.3)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0B0F17', // Near-black charcoal
          surface: '#111726',   // Card background
          hover: '#1B2436',     // Card hover state
          border: '#1E293B',    // Border color
        },
        brand: {
          DEFAULT: '#00F0FF',  // Electric cyan primary
          blue: '#0284C7',     // Electric blue
          sky: '#38BDF8',
          dark: '#0369A1',
        },
        ai: {
          purple: '#A855F7',   // AI element purple
          subtle: '#8B5CF6',
          bg: '#1E1B4B',
          border: '#4C1D95',
        },
        slate: {
          950: '#0B0F17',
          900: '#111726',
          850: '#161F33',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        status: {
          success: '#22C55E',
          warning: '#F59E0B',
          danger: '#EF4444',
          info: '#3B82F6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'card': '0 4px 20px -2px rgba(0, 0, 0, 0.4)',
        'ai-glow': '0 0 20px -5px rgba(168, 85, 247, 0.25)',
        'brand-glow': '0 0 20px -5px rgba(0, 240, 255, 0.25)',
      }
    },
  },
  plugins: [],
};

// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./React/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom yellow to match WrestleBet branding
        'wrestlebet-yellow': {
          400: '#ffc107',
          300: '#ffcd3a',
          500: '#e6ac00',
        },
        // Custom grays for the dark theme
        'wrestlebet-gray': {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
        }
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'glow-yellow': '0 0 20px rgba(255, 193, 7, 0.3)',
        'glow-yellow-lg': '0 0 40px rgba(255, 193, 7, 0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 193, 7, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(255, 193, 7, 0.6)' },
        },
      }
    },
  },
  plugins: [],
}
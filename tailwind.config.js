/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#070a12',
          900: '#0b0f1a',
          850: '#0f1524',
          800: '#141b2e',
          700: '#1d2740',
          600: '#2a3552',
        },
        brand: {
          DEFAULT: '#6d5efc',
          400: '#8b7dff',
          500: '#6d5efc',
          600: '#5a46f0',
          700: '#4a39d6',
        },
        lime: {
          DEFAULT: '#b6f500',
          400: '#c6ff38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 10px 30px -12px rgba(0,0,0,0.6)',
        glow: '0 10px 40px -10px rgba(109,94,252,0.55)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg,#6d5efc 0%,#8b7dff 50%,#b6f500 160%)',
        'card-grad': 'linear-gradient(160deg,rgba(109,94,252,0.14),rgba(255,255,255,0) 60%)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#050507',
          900: '#0a0a0d',
          850: '#101014',
          800: '#16161c',
          700: '#20202a',
          600: '#2c2c3a',
        },
        // Acento amarelo Olympus
        brand: {
          DEFAULT: '#e2ff00',
          400: '#eaff4d',
          500: '#e2ff00',
          600: '#c8e600',
          700: '#a8c000',
        },
        lime: {
          DEFAULT: '#b6f500',
          400: '#c6ff38',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Oswald', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 34px -14px rgba(0,0,0,0.75)',
        glow: '0 10px 40px -10px rgba(226,255,0,0.45)',
      },
      backgroundImage: {
        'brand-grad': 'linear-gradient(135deg,#e2ff00 0%,#c8e600 55%,#8aa300 140%)',
        'card-grad': 'linear-gradient(160deg,rgba(226,255,0,0.10),rgba(255,255,255,0) 60%)',
      },
      borderRadius: {
        '2xl': '1.1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}

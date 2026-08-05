/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0fdf6',
          100: '#dcfce9',
          200: '#bbf7d3',
          300: '#86efb0',
          400: '#4ade87',
          500: '#22c569',
          600: '#16a355',
          700: '#158046',
          800: '#15653a',
          900: '#135331',
        },
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b1b8c7',
          400: '#8691a8',
          500: '#67728c',
          600: '#525c74',
          700: '#434b5f',
          800: '#3a4050',
          900: '#232630',
          950: '#16181f',
        },
        ocupado: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
      },
      fontFamily: {
        display: ['"Lexend"', 'system-ui', 'sans-serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(22,24,31,0.04), 0 4px 14px rgba(22,24,31,0.06)',
        nav: '0 -2px 12px rgba(22,24,31,0.06)',
      },
      maxWidth: {
        app: '480px',
      },
    },
  },
  plugins: [],
}

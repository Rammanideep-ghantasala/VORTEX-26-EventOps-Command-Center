/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep luxury Burgundy dark-mode background palette
        gray: {
          950: '#090204', // Main app background: deepest velvet burgundy-black
          900: '#140409', // Cards / sidebar background
          850: '#1c060d', // Sub-cards / hover states
          800: '#280a13', // Card borders / dropdowns
          700: '#3f111f', // Distinct borders / inputs
          600: '#5c192e', // Dividers
          500: '#996371', // Muted text with warm rose undertone
          400: '#c59ca8', // Secondary text
          300: '#dfc2cb', // Body text
          200: '#efe0e5', // Bright text
          100: '#f8f2f4',
          50:  '#fdfafd',
        },
        // Re-mapping blue to Burgundy / Wine scale (#800020 & Rose/Crimson)
        blue: {
          50: '#fdf2f4',
          100: '#fce7ea',
          200: '#f9d1d8',
          300: '#f4aab7',
          400: '#fb7185', // Rose/Wine highlight
          500: '#e11d48', // Vibrant crimson
          600: '#9f1239', // Classic Burgundy (#800020 - #9f1239)
          700: '#881337', // Deep Wine Burgundy
          800: '#4c0519', // Dark Burgundy
          900: '#2b020c',
          950: '#180006',
        },
        // Re-mapping violet to Plum / Deep Royal Wine
        violet: {
          50: '#fdf4f9',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f472b6',
          400: '#e879f9',
          500: '#c026d3',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#581c87',
          900: '#3b0764',
          950: '#240046',
        },
        burgundy: {
          50: '#fff1f2',
          100: '#ffe4e6',
          200: '#fecdd3',
          300: '#fda4af',
          400: '#fb7185',
          500: '#e11d48',
          600: '#be123c',
          700: '#9f1239',
          800: '#881337', // #800020
          900: '#4c0519',
          950: '#27010a',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

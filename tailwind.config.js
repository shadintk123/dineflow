/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F4D3A',
          50: '#F0F6F3',
          100: '#DCE9E2',
          200: '#B9D3C4',
          300: '#88B59B',
          400: '#569176',
          500: '#356F54',
          600: '#1F4D3A',
          700: '#1B4232',
          800: '#16382B',
          900: '#0F261D',
        },
        accent: {
          DEFAULT: '#E7A33E',
          50: '#FDF6E8',
          100: '#FAE6C2',
          200: '#F4CC85',
          300: '#EFB84F',
          400: '#E7A33E',
          500: '#D18A24',
          600: '#A86A1B',
          700: '#7E4F16',
          800: '#553610',
          900: '#2C1C08',
        },
        ivory: '#F8F7F2',
        surface: '#FFFFFF',
        ink: '#202522',
        muted: '#6B726E',
        success: '#2E7D5B',
        warning: '#D98A24',
        error: '#C94B4B',
        line: '#E8E5DE',
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 1px 3px rgba(32, 37, 34, 0.06), 0 1px 2px rgba(32, 37, 34, 0.04)',
        card: '0 4px 16px rgba(32, 37, 34, 0.06), 0 1px 3px rgba(32, 37, 34, 0.04)',
        lift: '0 12px 32px rgba(32, 37, 34, 0.10), 0 4px 12px rgba(32, 37, 34, 0.06)',
        glow: '0 0 0 4px rgba(231, 163, 62, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.25)' },
          '100%': { transform: 'scale(1)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
        'scale-in': 'scale-in 0.3s ease-out both',
        'pop': 'pop 0.3s ease-out',
        'float': 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

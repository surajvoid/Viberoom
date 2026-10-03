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
        background: '#08090B',
        surface: {
          primary: '#111214',
          secondary: '#18191B',
          tertiary: '#202226',
        },
        content: {
          primary: '#F5F5F3',
          secondary: '#9A9A9A',
          muted: '#666666',
        },
        border: {
          subtle: '#242424',
          highlight: '#383838',
        }
      },
      fontFamily: {
        serif: ['"DM Serif Display"', '"Instrument Serif"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { transform: 'translateY(-20px) scale(1.1)', opacity: '1' },
          '80%': { transform: 'translateY(-130px) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-180px) scale(0.8)', opacity: '0' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      animation: {
        'float-up': 'float-up 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        'pulse-subtle': 'pulse-subtle 2s infinite ease-in-out',
      },
    },
  },
  plugins: [],
}

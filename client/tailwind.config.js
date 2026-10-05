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
        app: {
          bg: 'var(--app-bg)',
          surface: 'var(--app-surface)',
          elevated: 'var(--app-elevated)',
          text: 'var(--app-text)',
          muted: 'var(--app-text-muted)',
          border: 'var(--app-border)',
          'border-strong': 'var(--app-border-strong)',
          glass: 'var(--app-glass)',
          accent: 'var(--app-accent)',
        },
        accent: {
          pink: '#FF3D81',
          purple: '#8B5CF6',
          lime: '#B6F23A',
          cyan: '#22D3EE',
          coral: '#FF6B5A',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        'page-title': ['32px', { lineHeight: '38px', fontWeight: '700' }],
        'section-heading': ['20px', { lineHeight: '26px', fontWeight: '700' }],
        'body': ['15px', { lineHeight: '22px', fontWeight: '500' }],
        'meta': ['13px', { lineHeight: '18px', fontWeight: '500' }],
        'meta-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: {
        'chip': '12px',
        'card': '20px',
        'hero': '28px',
      },
      spacing: {
        'mobile-pad': '20px',
        'desktop-pad': '32px',
      },
      boxShadow: {
        'soft-1': '0 4px 20px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
        'soft-2': '0 12px 36px -4px rgba(0, 0, 0, 0.16), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
        'accent-glow': '0 8px 30px -4px var(--app-accent-glow)',
      },
      backdropBlur: {
        'glass': '24px',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.15)',
      },
    },
  },
  plugins: [],
}

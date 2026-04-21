/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'zen-dark': '#000000',
        'zen-text': '#86868b',
        'zen-text-h': '#f5f5f7',
        'zen-light': 'rgba(255, 255, 255, 0.14)',
        'zen-muted': '#86868b',
        'zen-purple': '#c084fc',
        'purdue-gold': '#aa3bff',
        'zen-gray': '#1d1d1f',
        'zen-accent': '#c084fc',
        'zen-accent-bg': 'rgba(192, 132, 252, 0.15)',
      },
      backgroundColor: {
        'glass-dark': 'rgba(28, 28, 30, 0.7)',
      },
      backdropBlur: {
        '20': '20px',
      },
      transitionProperty: {
        'gentle': 'all 0.3s ease',
      },
      boxShadow: {
        'zen': '0 10px 40px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-subtle': 'linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.05))',
      },
    },
  },
  plugins: [],
}

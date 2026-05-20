/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        body: '#F8FAFC',
        surface: '#FFFFFF',
        border: '#E2E8F0',
        primary: '#2563EB',
      },
      boxShadow: {
        soft: '0 18px 60px rgba(15, 23, 42, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}


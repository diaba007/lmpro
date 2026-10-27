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
        lmpro: {
          dark: '#081426',
          card: '#0D1E38',
          cardBorder: '#162C50',
          accent: '#0066FF',
          accentHover: '#0052CC',
          success: '#00D68F',
          muted: '#94A3B8',
          danger: '#FF4D4D',
          warning: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
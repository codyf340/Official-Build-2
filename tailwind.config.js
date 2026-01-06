/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
    "!./node_modules/**"
  ],
  theme: {
    extend: {
      animation: {
        'marquee-fast': 'marquee-fast 40s linear infinite',
      },
      keyframes: {
        'marquee-fast': {
          'from': { transform: 'translateX(0)' },
          'to': { transform: 'translateX(-50%)' },
        }
      }
    },
  },
  plugins: [],
}
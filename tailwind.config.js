/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: { ink: '#17202a', moss: '#176b5a', mint: '#d8ebe4' },
    },
  },
  plugins: [],
};

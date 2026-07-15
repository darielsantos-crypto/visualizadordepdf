/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: '#004883',
          'blue-dark': '#00345f',
          'blue-soft': '#0a5a91',
          red: '#EF3340',
          stage: '#555',
          'text-dark': '#173044',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

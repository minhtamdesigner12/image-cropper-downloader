/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",  // if you use src/
    "./app/**/*.{js,ts,jsx,tsx}",  // if you use app/ (Next.js)
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

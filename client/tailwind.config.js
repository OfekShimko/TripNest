/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  // Add this line
  darkMode: 'class', // Enables dark mode via a CSS class
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

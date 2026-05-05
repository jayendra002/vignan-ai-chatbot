/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vignan: {
          light: '#e6f0fa',
          main: '#1a56db', 
          dark: '#1e3a8a',
        }
      }
    },
  },
  plugins: [],
}
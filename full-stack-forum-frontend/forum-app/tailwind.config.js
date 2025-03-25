/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        playfair: ['Playfair Display'],
        lato: ['Lato']
      }
    },
  },
  plugins: [],
};
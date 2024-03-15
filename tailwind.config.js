/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      lineHeight: {
        "tighter": "0.5rem"
      }
    },
  },
  plugins: [],
}
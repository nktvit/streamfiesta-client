/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    // "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      lineHeight: {
        "tighter": "0.5rem"
      }
    },
  },
  plugins: [
    // require('flowbite/plugin')
  ],
}

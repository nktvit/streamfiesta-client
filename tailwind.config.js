import fluid, { extract } from 'fluid-tailwind'


/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    extract
    // "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      lineHeight: {
        "tighter": "0.5rem"
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
    fluid
  ],
}

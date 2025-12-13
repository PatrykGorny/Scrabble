/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./node_modules/flowbite-react/dist/**/*.js",
  ],
  plugins: [
    require("flowbite/plugin")
  ],
}
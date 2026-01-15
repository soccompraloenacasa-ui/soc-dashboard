/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ml: '#eab308',
        dropi: '#ea580c',
        shopify: '#16a34a',
        meta: '#0081fb',
        gastos: '#dc2626',
        profit: '#2563eb'
      }
    },
  },
  plugins: [],
}

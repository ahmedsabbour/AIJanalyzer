/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#0D47A1',
        'brand-secondary': '#1565C0',
        'brand-accent': '#2196F3',
        'neutral-light': '#F5F5F5',
        'neutral-dark': '#212121',
        'neutral-medium': '#424242',
      },
    },
  },
  plugins: [],
}

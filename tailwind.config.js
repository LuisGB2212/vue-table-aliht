/** @type {import('tailwindcss').Config} */
const plugin = require("tailwindcss/plugin");
const colors = require("tailwindcss/colors");
const { parseColor } = require("tailwindcss/lib/util/color");

/** Converts HEX color to RGB */
const toRGB = (value) => {
  return parseColor(value).color.join(" ");
};
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  // preflight: true en dev (style.dev.css), false en lib (style.css)
  // Cada archivo CSS controla esto — no necesitamos lógica aquí
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        brand: {
          50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
          400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
          800: '#854d0e', 900: '#713f12',
        },
        surface: {
          DEFAULT: '#ffffff', 50: '#fafafa', 100: '#f5f5f5',
          200: '#e5e5e5', 800: '#262626', 900: '#171717',
        }
      },
      boxShadow: {
        'table': '0 1px 3px 0 rgba(0,0,0,0.06), 0 1px 2px -1px rgba(0,0,0,0.06)',
        'dropdown': '0 10px 40px -5px rgba(0,0,0,0.12), 0 4px 16px -4px rgba(0,0,0,0.08)',
      }
    },
  },
  plugins: [
    plugin(function ({ addBase }) {
      addBase({
        // Default colors
        ":root": {
          "--color-theme-1": toRGB(colors.blue["800"]),
          "--color-theme-2": toRGB(colors.blue["900"]),
          "--color-primary": toRGB(colors.blue["900"]),
          "--color-secondary": toRGB(colors.slate["200"]),
          "--color-success": toRGB(colors.lime["600"]),
          "--color-info": toRGB(colors.cyan["500"]),
          "--color-warning": toRGB(colors.yellow["400"]),
          "--color-pending": toRGB(colors.orange["500"]),
          "--color-danger": toRGB(colors.red["600"]),
          "--color-light": toRGB(colors.slate["100"]),
          "--color-dark": toRGB(colors.slate["800"]),
        },
      })
    })
  ],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
        husband: {
          light: '#EFF6FF',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        },
        wife: {
          light: '#FFF7ED',
          DEFAULT: '#F97316',
          dark: '#C2410C',
        },
        common: {
          light: '#ECFDF5',
          DEFAULT: '#10B981',
          dark: '#047857',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', '"Segoe UI"', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

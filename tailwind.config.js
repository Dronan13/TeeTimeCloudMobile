/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // TeeTime Cloud brand colors
        primary: {
          DEFAULT: '#22c55e',
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        // Light mode colors
        light: {
          background: '#f9fafb',
          foreground: '#1f2937',
          card: '#ffffff',
          border: '#e5e7eb',
          muted: '#6b7280',
        },
        // Dark mode colors
        dark: {
          background: '#111827',
          foreground: '#f9fafb',
          card: '#1f2937',
          border: '#374151',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};

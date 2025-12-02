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
        // TeeTime Cloud premium golf-inspired palette
        primary: {
          DEFAULT: '#2d7a4e',
          50: '#f0f9f4',
          100: '#daf1e4',
          200: '#b3e3c9',
          300: '#7ecda3',
          400: '#4bb078',
          500: '#2d7a4e',
          600: '#236140',
          700: '#1d4d34',
          800: '#183d2a',
          900: '#133224',
        },
        // Premium greens
        fairway: {
          light: '#5fa777',
          DEFAULT: '#3d8b5d',
          dark: '#2d6b45',
        },
        // Accent colors
        accent: {
          gold: '#c5a572',
          bronze: '#b8956a',
          sand: '#d4c4a8',
        },
        // Neutrals - premium charcoal and cool grays
        neutral: {
          50: '#f8f9fa',
          100: '#e9ecef',
          200: '#d1d6db',
          300: '#adb5bd',
          400: '#868e96',
          500: '#495057',
          600: '#343a40',
          700: '#2b3137',
          800: '#212529',
          900: '#1a1d21',
        },
        // Light mode colors
        light: {
          background: '#f8f9fa',
          foreground: '#212529',
          card: '#ffffff',
          border: '#d1d6db',
          muted: '#868e96',
        },
        // Dark mode colors - deep charcoal with green undertones
        dark: {
          background: '#1a1d21',
          foreground: '#f8f9fa',
          card: '#2b3137',
          border: '#343a40',
          muted: '#adb5bd',
        },
      },
    },
  },
  plugins: [],
};

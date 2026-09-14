// Mantido em sincronia manualmente com src/theme/colors.ts
// (tailwind.config.js roda em Node puro, sem transpilar TS/ESM).
const colors = {
  forest: '#26311E',
  gold: '#E3C17E',
  cream: '#F4EEE2',
  ink: '#1A1A1A',
  muted: '#8A8A80',
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
    },
  },
  plugins: [],
};

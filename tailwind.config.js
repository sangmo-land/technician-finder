/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E40AF',
          light: '#3B82F6',
          dark: '#1E3A8A',
          muted: '#DBEAFE',
        },
        secondary: {
          DEFAULT: '#475569',
          light: '#64748B',
        },
        success: {
          DEFAULT: '#059669',
          light: '#D1FAE5',
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2',
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7',
        },
        surface: '#FFFFFF',
        background: '#F8FAFC',
        text: {
          DEFAULT: '#0F172A',
          secondary: '#475569',
          muted: '#94A3B8',
          light: '#CBD5E1',
        },
        border: {
          DEFAULT: '#E2E8F0',
          light: '#F1F5F9',
        },
        skill: {
          plumber: '#2563EB',
          electrician: '#D97706',
          carpenter: '#7C3AED',
          mason: '#DC2626',
          painter: '#059669',
        },
      },
    },
  },
  plugins: [],
};

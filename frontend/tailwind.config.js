/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dynamic Theme Palette using DaisyUI Variables
        background: 'hsl(var(--b1) / <alpha-value>)', // base-100
        surface: 'hsl(var(--b2) / <alpha-value>)',    // base-200
        primary: {
          DEFAULT: 'hsl(var(--p) / <alpha-value>)',   // primary
          hover: 'hsl(var(--pf) / <alpha-value>)',    // primary focus
          glow: 'hsl(var(--p) / 0.5)'
        },
        secondary: {
          DEFAULT: 'hsl(var(--s) / <alpha-value>)',   // secondary
          hover: 'hsl(var(--sf) / <alpha-value>)',    // secondary focus
        },
        accent: {
          DEFAULT: 'hsl(var(--a) / <alpha-value>)',   // accent
          glow: 'hsl(var(--a) / 0.5)'
        },
        content: {
          primary: 'hsl(var(--bc) / <alpha-value>)',   // base-content
          secondary: 'hsl(var(--bc) / 0.7)',           // base-content with opacity
        },
        border: 'hsl(var(--bc) / 0.2)',                // base-content with low opacity
      },
      fontFamily: {
        sans: ['Inter var', 'sans-serif'],
        display: ['Outfit', 'sans-serif'], // For headings
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      },
      backgroundImage: {
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/colors/themes")["[data-theme=light]"],
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          accent: '#f43f5e',
          neutral: '#1e293b',
          "base-100": '#ffffff', // Pure White
          "base-200": '#f1f5f9', // Slate 100
          "base-300": '#e2e8f0', // Slate 200
          "base-content": '#0f172a', // Slate 900 (High Contrast Text)
        },
        dark: {
          ...require("daisyui/src/colors/themes")["[data-theme=dark]"],
          primary: '#8b5cf6',
          secondary: '#06b6d4',
          accent: '#f43f5e',
          neutral: '#1e293b',
          "base-100": '#0f172a', // Slate 900 (Original Dark Background)
          "base-200": '#1e293b', // Slate 800 (Original Dark Surface)
          "base-300": '#334155', // Slate 700
          "base-content": '#f8fafc', // Slate 50 (Original Light Text)
        },
      }
    ]
  }
}
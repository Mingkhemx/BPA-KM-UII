/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uii: {
          blue: {
            50: '#eef6ff',
            100: '#d9eaff',
            200: '#bbd9fe',
            300: '#8cc2fd',
            400: '#56a0fa',
            500: '#2f7ef4',
            600: '#1b60e6',
            700: '#144bc6',
            800: '#163fa0',
            900: '#06337b', // Primary UII blue
            950: '#031c48',
          },
          gold: {
            DEFAULT: '#ffe600',
            400: '#fef08a',
            500: '#ffe600',
            600: '#eab308',
            700: '#ca8a04',
          },
          dark: '#0a192f',
          surface: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        heading: ['Oswald', 'Plus Jakarta Sans', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(6, 51, 123, 0.08), 0 2px 6px -1px rgba(6, 51, 123, 0.04)',
        'elevated': '0 20px 30px -10px rgba(6, 51, 123, 0.15)',
        'glow': '0 0 25px rgba(255, 230, 0, 0.35)',
      }
    },
  },
  plugins: [],
}


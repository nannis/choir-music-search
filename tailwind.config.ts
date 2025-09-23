import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'hsl(45 15% 95%)',
          100: 'hsl(45 15% 90%)',
          200: 'hsl(45 15% 80%)',
          300: 'hsl(45 15% 70%)',
          400: 'hsl(45 15% 60%)',
          500: 'hsl(45 7% 25%)',
          600: 'hsl(45 7% 15%)',
          700: 'hsl(45 7% 10%)',
          800: 'hsl(42 7% 8%)',
          900: 'hsl(40 7% 5%)',
        },
        secondary: {
          50: 'hsl(42 25% 98%)',
          100: 'hsl(42 20% 95%)',
          200: 'hsl(42 15% 85%)',
          300: 'hsl(42 15% 75%)',
          400: 'hsl(42 15% 65%)',
          500: 'hsl(42 15% 55%)',
          600: 'hsl(42 15% 45%)',
          700: 'hsl(42 15% 35%)',
          800: 'hsl(42 15% 25%)',
          900: 'hsl(42 15% 15%)',
        },
        cream: {
          50: 'hsl(42 25% 98%)',
          100: 'hsl(42 20% 95%)',
          200: 'hsl(42 15% 90%)',
        },
        accent: {
          50: 'hsl(200 25% 95%)',
          100: 'hsl(200 20% 90%)',
          200: 'hsl(200 15% 80%)',
          300: 'hsl(200 15% 70%)',
          400: 'hsl(200 15% 60%)',
          500: 'hsl(200 15% 50%)',
          600: 'hsl(200 15% 40%)',
          700: 'hsl(200 15% 30%)',
          800: 'hsl(200 15% 25%)',
          900: 'hsl(200 15% 20%)',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'Crimson Text', 'Georgia', 'serif'],
        sans: ['Crimson Text', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config

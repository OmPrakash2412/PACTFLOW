/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        beige: {
          50: '#FAF8F5',
          100: '#F5EFEB',
          200: '#EBE2D5',
          300: '#DFD2C0',
          400: '#C8B59E',
          500: '#B29A7F',
          600: '#8F765D',
          700: '#6C5844',
          800: '#4A3B2D',
          900: '#2C2219',
          950: '#1A140E',
        },
        primary: {
          DEFAULT: "#7C3AED", // Warm violet / indigo
          foreground: "#FFFFFF",
          hover: "#6D28D9",
        },
        bronze: {
          DEFAULT: "#966A38",
          light: "#B88950",
          dark: "#6B4920",
        },
        navy: {
          950: "#FAF8F5",
          900: "#F4EEE5",
          850: "#ECE3D6",
          800: "#E2D6C5",
          700: "#C9BAA5",
          600: "#8D7C68",
        },
        accent: {
          purple: "#7C3AED",
          blue: "#2563EB",
          emerald: "#059669",
          amber: "#D97706",
          rose: "#E11D48",
        }
      },
      borderRadius: {
        lg: "0.875rem",
        md: "0.625rem",
        sm: "0.375rem",
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(160, 140, 115, 0.15)',
        'glass-hover': '0 14px 44px 0 rgba(160, 140, 115, 0.22)',
        'glass-sm': '0 4px 16px 0 rgba(160, 140, 115, 0.10)',
        'glass-lg': '0 20px 50px 0 rgba(160, 140, 115, 0.25)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './index.html',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontSize: {
        '2xs': '10px',
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          dark: '#8ab4f8',
          hover: '#0842a0',
          'hover-dark': '#aecbfa',
          container: '#e8f0fe',
          'container-dark': '#2d2e30',
          'on-container': '#1967d2',
          'on-container-dark': '#d2e3fc',
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          dark: '#d0bcff',
          container: '#f3e8ff',
          'container-dark': '#4a0072',
          'on-container': '#6b21a8',
          'on-container-dark': '#eaddff',
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Legacy theme tokens (integrated)
        surface: {
          DEFAULT: '#ffffff',
          dark: '#1b1b1b',
          variant: '#f8f9fa',
          'variant-dark': '#0f1114',
        },
        outline: {
          DEFAULT: '#dadce0',
          dark: '#3c4043',
          focus: '#0b57d0',
        },
        content: {
          DEFAULT: '#1f1f1f',
          dark: '#e3e3e3',
          secondary: '#444746',
          'secondary-dark': '#c4c7c5',
          tertiary: '#8e918f',
          'tertiary-dark': '#5f6368',
        },
        danger: {
          DEFAULT: '#ba1a1a',
          dark: '#ffb4ab',
          container: '#ffdad6',
          'container-dark': '#93000a',
          'on-container': '#410002',
          'on-container-dark': '#ffdad6',
        },
        success: {
          DEFAULT: '#137333',
          dark: '#81c995',
          container: '#ceead6',
          'container-dark': '#0c3b20',
        },
        warning: {
          DEFAULT: '#e37400',
          dark: '#fcad70',
          container: '#feefc3',
          'container-dark': '#4a2800',
          'on-container': '#bf5000',
          'on-container-dark': '#ffdcbe',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ['Roboto', 'sans-serif'],
        google: ['Google Sans', 'sans-serif'],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        enterUp: {
          '0%': { transform: 'translateY(50px) scale(0.96)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
        viewEnter: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        growHeight: {
          '0%': { height: '0%' },
          '100%': { height: '100%' },
        },
        strikethrough: {
          '0%': { width: '0%' },
          '100%': { width: '100%' },
        },
        'gradient-xy': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'enter-up': 'enterUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'view-enter': 'viewEnter 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'gradient-xy': 'gradient-xy 3s ease infinite',
        'grow-height': 'growHeight 1s ease-out forwards',
        'strikethrough': 'strikethrough 0.3s ease-in-out forwards',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

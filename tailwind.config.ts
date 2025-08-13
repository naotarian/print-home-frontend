import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: {
      'xs': '320px',      // Extra small devices (phones)
      'sm': '480px',      // Small devices (large phones)
      'md': '768px',      // Medium devices (tablets)
      'lg': '1024px',     // Large devices (small desktops)
      'xl': '1280px',     // Extra large devices (desktops)
      '2xl': '1536px',    // 2X large devices (large desktops)
      '3xl': '1920px',    // 3X large devices (very large screens)
      '4xl': '2560px',    // 4X large devices (ultra wide screens)
      
      // Custom breakpoints for specific use cases
      'mobile': '375px',   // Standard mobile width
      'tablet': '768px',   // Standard tablet width
      'laptop': '1024px',  // Standard laptop width
      'desktop': '1440px', // Standard desktop width
      'ultrawide': '2560px', // Ultra wide monitors
      
      // Max-width breakpoints (useful for mobile-first design)
      'max-xs': {'max': '319px'},
      'max-sm': {'max': '479px'},
      'max-md': {'max': '767px'},
      'max-lg': {'max': '1023px'},
      'max-xl': {'max': '1279px'},
      'max-2xl': {'max': '1535px'},
      
      // Range breakpoints (between two sizes)
      'sm-md': {'min': '480px', 'max': '767px'},
      'md-lg': {'min': '768px', 'max': '1023px'},
      'lg-xl': {'min': '1024px', 'max': '1279px'},
      'xl-2xl': {'min': '1280px', 'max': '1535px'},
      
      // Portrait and landscape orientation
      'portrait': {'raw': '(orientation: portrait)'},
      'landscape': {'raw': '(orientation: landscape)'},
      
      // High DPI screens (Retina displays)
      'retina': {'raw': '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'},
      
      // Touch devices
      'touch': {'raw': '(hover: none) and (pointer: coarse)'},
      'no-touch': {'raw': '(hover: hover) and (pointer: fine)'},
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        'xs': '0.5rem',
        'sm': '1rem',
        'md': '1.5rem',
        'lg': '2rem',
        'xl': '2.5rem',
        '2xl': '3rem',
      },
      screens: {
        'xs': '320px',
        'sm': '480px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
        '3xl': '1920px',
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
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
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;

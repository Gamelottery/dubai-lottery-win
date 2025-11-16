import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
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
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          light: "hsl(var(--primary-light))",
          dark: "hsl(var(--primary-dark))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
          light: "hsl(var(--secondary-light))",
          dark: "hsl(var(--secondary-dark))",
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
          light: "hsl(var(--accent-light))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
          light: "hsl(var(--card-light))",
        },
      },
      backgroundImage: {
        'gradient-primary': 'var(--gradient-primary)',
        'gradient-secondary': 'var(--gradient-secondary)',
        'gradient-background': 'var(--gradient-background)',
        'gradient-card': 'var(--gradient-card)',
      },
      boxShadow: {
        'primary': 'var(--shadow-primary)',
        'secondary': 'var(--shadow-secondary)',
        'card': 'var(--shadow-card)',
        'glow': 'var(--shadow-glow)',
      },
      animation: {
        'lottery-pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'lottery-bounce': 'bounce 1s infinite',
        'lottery-spin': 'spin 3s linear infinite',
        'lottery-glow': 'pulse 2s ease-in-out infinite alternate',
        'shimmer': 'shimmer 3s linear infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'gold-glow': 'gold-glow 3s ease-in-out infinite',
        'luxury-pulse': 'luxury-pulse 2s ease-in-out infinite',
        'fall': 'fall linear forwards',
        'spin-slow': 'spin-slow 1s linear infinite',
        'scale-in': 'scale-in 0.5s ease-out forwards',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% center",
          },
          "100%": {
            backgroundPosition: "200% center",
          },
        },
        "sparkle": {
          "0%, 100%": {
            opacity: "1",
            transform: "scale(1)",
          },
          "50%": {
            opacity: "0.7",
            transform: "scale(1.05)",
          },
        },
        "gold-glow": {
          "0%, 100%": {
            boxShadow: "0 0 20px hsl(45 100% 51% / 0.3), 0 0 40px hsl(45 100% 51% / 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px hsl(45 100% 51% / 0.5), 0 0 60px hsl(45 100% 51% / 0.3), 0 0 80px hsl(45 100% 51% / 0.1)",
          },
        },
        "luxury-pulse": {
          "0%, 100%": {
            opacity: "1",
            filter: "brightness(1)",
          },
          "50%": {
            opacity: "0.9",
            filter: "brightness(1.2)",
          },
        },
        "fall": {
          "0%": {
            transform: "translateY(0) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
        "spin-slow": {
          from: {
            transform: "rotate(0deg)",
          },
          to: {
            transform: "rotate(360deg)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.5)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.1)",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
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

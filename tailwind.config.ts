import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm Beige & Cream Backgrounds
        beige: {
          50: "#FAF7F2",
          100: "#F5EFEB",
          200: "#EFE8DF",
          300: "#E3D7C8",
          400: "#D1C0AC",
          500: "#B8A38B",
        },
        // Chocolate Brown & Dark Coffee Text / Primary
        coffee: {
          50: "#F7F5F2",
          100: "#EBE5DE",
          200: "#D7CCC0",
          400: "#8C7362",
          600: "#5D4537",
          700: "#4A3427",
          800: "#3D271D",
          900: "#2D1E18",
          950: "#1E130E",
        },
        // Pastel Pencil Colors for Buttons, Badges, Highlights
        pencil: {
          // Soft Sage Green (Positive nutrition insights)
          sage: {
            50: "#F3F8F5",
            100: "#E4F1E9",
            200: "#C9E3D3",
            300: "#A7D1B7",
            400: "#7FB894",
            500: "#4D8F65",
            600: "#3B7A52",
            700: "#275A3A",
          },
          // Muted Peach (Secondary actions)
          peach: {
            50: "#FFF6F2",
            100: "#FDE8E0",
            200: "#FCD0C0",
            300: "#F7B29B",
            400: "#EE8C6E",
            500: "#D76846",
            600: "#B84B29",
            700: "#8D3418",
          },
          // Dusty Blue (Informational actions)
          blue: {
            50: "#F4F8FD",
            100: "#E5F0FA",
            200: "#CEE2F6",
            300: "#ABCFF0",
            400: "#7EAFDE",
            500: "#4C8CC7",
            600: "#366E9E",
            700: "#254F75",
          },
          // Pale Yellow (Highlights)
          yellow: {
            50: "#FEFDF0",
            100: "#FDF9D7",
            200: "#FAF0AE",
            300: "#F5E47E",
            400: "#EBD24E",
            500: "#D4B926",
            600: "#9A7B0D",
            700: "#715707",
          },
          // Terracotta (Important actions)
          terracotta: {
            50: "#FDF5F2",
            100: "#FCE6DF",
            200: "#F8CABE",
            300: "#F1A593",
            400: "#E07A5F",
            500: "#C85C40",
            600: "#A8442A",
            700: "#83301A",
          },
        },
        // Legacy aliases to preserve existing component compat
        forest: {
          50: "#F3F8F5",
          100: "#E4F1E9",
          200: "#C9E3D3",
          300: "#A7D1B7",
          400: "#7FB894",
          500: "#4D8F65",
          600: "#3B7A52",
          700: "#275A3A",
          800: "#3D271D",
          900: "#2D1E18",
          950: "#1E130E",
        },
        mint: {
          50: "#F3F8F5",
          100: "#E4F1E9",
          200: "#C9E3D3",
          300: "#A7D1B7",
          400: "#7FB894",
          500: "#4D8F65",
          600: "#3B7A52",
        },
        ivory: {
          50: "#FAF7F2",
          100: "#F5EFEB",
          200: "#EFE8DF",
          300: "#E3D7C8",
          400: "#D1C0AC",
        },
        charcoal: {
          700: "#5D4537",
          800: "#4A3427",
          900: "#2D1E18",
          950: "#1E130E",
        },
      },
      fontFamily: {
        serif: [
          "Lora",
          "DM Serif Display",
          "Georgia",
          "Cambria",
          "serif",
        ],
        sans: [
          "DM Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        warm: "0 2px 8px -2px rgba(61, 39, 29, 0.06), 0 1px 3px -1px rgba(61, 39, 29, 0.04)",
        card: "0 4px 14px -2px rgba(61, 39, 29, 0.08), 0 2px 6px -1px rgba(61, 39, 29, 0.04)",
        float: "0 12px 28px -6px rgba(61, 39, 29, 0.12), 0 4px 10px -2px rgba(61, 39, 29, 0.06)",
        subtle: "0 1px 3px 0 rgba(61, 39, 29, 0.05)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};

export default config;

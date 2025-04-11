/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Roboto", "sans-serif"],
      },
      colors: {
        primary: {
          light: "#DAD2FF",
          DEFAULT: "#8F87F1",
          dark: "#6F6AE8",
        },
        secondary: "#007AFF",
        accent: "#FF2C55",
        background: "#F3F2F8",
        hover: "#D2D1D7",
        text: "#000000",
      },
    },
  },
  plugins: [],
};

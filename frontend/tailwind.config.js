/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0b0d10",
        surface: "#14171c",
        "surface-2": "#1a1e24",
        border: "#232932",
        "border-2": "#2a313c",
        accent: "#4f8cff",
        muted: "#9aa0ab",
        subtle: "#6b727e",
        heading: "#f4f6f9",
        body: "#e6e8ec",
        label: "#c4c9d2",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

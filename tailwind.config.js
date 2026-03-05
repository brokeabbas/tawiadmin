/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.10)",
      },
      colors: {
        // Adjust these to match your brand exactly
        "tawi-bg": "#F6F7F4",
        "tawi-leaf": "#2F8F5B",
        "tawi-dark": "#101828",
        "tawi-charcoal2": "#475467",
      },
    },
  },
  plugins: [],
};
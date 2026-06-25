export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          blue: "#1E3A8A",
          orange: "#F97316",
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      }
    }
  },
  plugins: [],
}
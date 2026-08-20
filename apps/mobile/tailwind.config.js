/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./src/**/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        poppins: ["Poppins_400Regular"],
        poppinsBold: ["Poppins_700Bold"],
      },
      colors: {
        wedgewood: {
          50: "#f2f9f9",
          100: "#ddeff0",
          200: "#bfe0e2",
          300: "#92cace",
          400: "#5faab1",
          500: "#438e96",
          600: "#3b757f",
          700: "#356169",
          800: "#325158",
          900: "#2d464c",
          950: "#1a2c32",
        },
      },
    },
  },
  plugins: [],
};

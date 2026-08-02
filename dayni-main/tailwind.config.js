/* eslint-disable import/no-anonymous-default-export */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
 theme: {
  extend: {
    keyframes: {
      progress: {
        "0%":   { width: "0%" },
        "100%": { width: "100%" },
      },
    },
  },
},
  plugins: [],
};
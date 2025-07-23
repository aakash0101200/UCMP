export default {
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  
  theme: {
    extend: {
      colors: {
        aliceblue: '#F0F8FF',
      },
    },
  },

  
  plugins: [
     require('@tailwindcss/forms'),
     require('@tailwindcss/typography'),
     require('@tailwindcss/aspect-ratio'),
  ],
 

};

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#FF9900',
        secondary: '#146EB4',
        dark: '#1a1a1a',
      },
      fontFamily: {
        sans: ['Amazon Ember', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

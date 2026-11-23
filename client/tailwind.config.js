export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50: '#eef2f9', 100: '#d9e2f1', 200: '#b3c4e0', 500: '#2c4a85', 600: '#1e3a6e', 700: '#162d57', 800: '#0f2144', 900: '#0a1730' },
        gold: { 50: '#fdf8e8', 100: '#faefc4', 400: '#e2b93b', 500: '#c9a227', 600: '#a8841c' }
      },
      fontFamily: { display: ['"Merriweather"', 'Georgia', 'serif'], sans: ['"Source Sans 3"', 'system-ui', 'sans-serif'] }
    }
  },
  plugins: []
};

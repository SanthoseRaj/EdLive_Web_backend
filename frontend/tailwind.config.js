/** @type {import('tailwindcss').Config} */
import daisyui from 'daisyui';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: '#007AFF',      // Bright blue accent
        secondary: '#E9A9D0',    // Pink background
        background: '#F9F5F7',   // Page background
        text: '#333333',         // Default text
        grayLight: '#F0F0F0',    // Card / border
        grayMedium: '#B0B0B0',   // Muted labels
      },

      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
    },
  },

  plugins: [daisyui],

  daisyui: {
    themes: [
      "light",
      {
        black: {
          primary: "#1d9bf0",
          secondary: "#181818",
          accent: "#37CDBE",
          neutral: "#3D4451",
          "base-100": "#000000",
          "base-content": "#6b7280",
        },
      },
    ],
  },

  ignoreWarnings: [
    {
      module: /node_modules\/react-datepicker/,
    },
  ],
};

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold:      '#C9A84C',
        'gold-light': '#e8c97a',
        'gold-dim':   '#8a6e2e',
        'gold-bg':    '#16120a',
        surface:   '#0e0d08',
        surface2:  '#141208',
        surface3:  '#1c1a0f',
        border:    '#2a2410',
        border2:   '#3a3318',
        muted:     '#7a6e52',
        dim:       '#4a4232',
        success:   '#6db887',
        danger:    '#c97070',
        warn:      '#c9a44c',
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        sm: '6px',
        md: '10px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
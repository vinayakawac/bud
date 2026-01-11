/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: 'var(--dark-bg)',
          surface: 'var(--dark-surface)',
          border: 'var(--dark-border)',
          text: {
            primary: 'var(--dark-text-primary)',
            secondary: 'var(--dark-text-secondary)',
          },
          accent: 'var(--dark-accent)',
        },
        light: {
          bg: 'var(--light-bg)',
          surface: 'var(--light-surface)',
          border: 'var(--light-border)',
          text: {
            primary: 'var(--light-text-primary)',
            secondary: 'var(--light-text-secondary)',
          },
          accent: 'var(--light-accent)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

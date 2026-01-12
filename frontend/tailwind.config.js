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
        bg: 'var(--bg)',
        bgSecondary: 'var(--bg-secondary)',
        card: 'var(--card)',
        cardHover: 'var(--card-hover)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
        border: 'var(--border)',
        borderHover: 'var(--border-hover)',
        accent: 'var(--accent)',
        accentHover: 'var(--accent-hover)',
        inputBg: 'var(--input-bg)',
        inputBorder: 'var(--input-border)',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
}

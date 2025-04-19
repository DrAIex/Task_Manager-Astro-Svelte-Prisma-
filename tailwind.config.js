/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
        },
        task: {
          'low': 'var(--priority-low-bg)',
          'low-text': 'var(--priority-low-text)',
          'medium': 'var(--priority-medium-bg)', 
          'medium-text': 'var(--priority-medium-text)',
          'high': 'var(--priority-high-bg)',
          'high-text': 'var(--priority-high-text)',
        }
      },
    },
  },
  plugins: [],
}


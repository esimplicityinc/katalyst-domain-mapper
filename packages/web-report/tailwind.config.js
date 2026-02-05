/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        foe: {
          feedback: '#3b82f6',
          understanding: '#8b5cf6',
          confidence: '#10b981',
          critical: '#ef4444',
          warning: '#f59e0b',
          success: '#22c55e',
        },
        terminal: {
          green: '#00ff00',
          amber: '#ffb000',
          bg: '#0d1117',
          border: '#30363d',
        },
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}

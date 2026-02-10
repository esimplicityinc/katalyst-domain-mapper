import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        feedback: {
          light: '#3b82f6',
          DEFAULT: '#2563eb',
          dark: '#1e40af',
        },
        understanding: {
          light: '#8b5cf6',
          DEFAULT: '#7c3aed',
          dark: '#6d28d9',
        },
        confidence: {
          light: '#10b981',
          DEFAULT: '#059669',
          dark: '#047857',
        },
        governance: {
          proposed: '#64748b',     // slate-500
          'adr-validated': '#3b82f6', // blue-500
          'bdd-pending': '#06b6d4',   // cyan-500
          'bdd-complete': '#14b8a6',  // teal-500
          implementing: '#f59e0b',    // amber-500
          'nfr-validating': '#8b5cf6', // purple-500
          'nfr-blocked': '#ef4444',   // red-500
          complete: '#22c55e',        // green-500
        },
        ddd: {
          context: '#8b5cf6',
          aggregate: '#6366f1',
          event: '#14b8a6',
        },
      },
    },
  },
  plugins: [typography],
}

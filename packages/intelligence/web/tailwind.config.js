import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // Enable class-based dark mode with fallback to system preference
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ============================================
        // KATALYST BRAND COLORS
        // ============================================
        brand: {
          primary: {
            300: '#6BE6E7',    // Light teal (hover backgrounds)
            500: '#2ECED0',    // Main teal (primary actions, active nav)
            600: '#1FA3A6',    // Dark teal (hover states, pressed)
            700: '#158688',    // Darker for text on light backgrounds
            DEFAULT: '#2ECED0',
          },
          accent: {
            lavender: '#8B93B6',  // Soft purple-gray accent
            steel: '#5C7C99',     // Blue-gray accent
            DEFAULT: '#8B93B6',
          },
        },

        // ============================================
        // FOE SEMANTIC COLORS (Dimensions)
        // ============================================
        foe: {
          feedback: {
            light: '#4DA3FF',
            DEFAULT: '#4DA3FF',
            dark: '#3B82F6',
            darker: '#2563EB',
          },
          understanding: {
            light: '#7A99B8',    // Lighter steel
            DEFAULT: '#5C7C99',  // Steel blue (replaces purple!)
            dark: '#4A6B85',
            darker: '#3A5468',
          },
          confidence: {
            light: '#2DD4A7',    // Katalyst success green
            DEFAULT: '#2DD4A7',
            dark: '#22C597',
            darker: '#18A077',
          },
        },

        // ============================================
        // CONSOLIDATED GOVERNANCE (5 states: was 8)
        // ============================================
        governance: {
          draft: '#8B93B6',      // Lavender (proposed, early stage)
          active: '#4DA3FF',     // Info blue (implementing, in progress)
          validating: '#F5B942', // Warning amber (testing, validating)
          blocked: '#E5533D',    // Error red (blocked, issues)
          complete: '#2DD4A7',   // Success green (done!)
        },

        // ============================================
        // UI FUNCTIONAL COLORS
        // ============================================
        ui: {
          success: {
            light: '#2DD4A7',
            DEFAULT: '#2DD4A7',
            dark: '#22C597',
          },
          warning: {
            light: '#F5B942',
            DEFAULT: '#F5B942',
            dark: '#D99E2A',
          },
          error: {
            light: '#E5533D',
            DEFAULT: '#E5533D',
            dark: '#C93F2D',
          },
          info: {
            light: '#4DA3FF',
            DEFAULT: '#4DA3FF',
            dark: '#3B82F6',
          },
        },

        // ============================================
        // DDD COLORS (Updated: steel replaces purple)
        // ============================================
        ddd: {
          context: '#5C7C99',    // Steel (was purple)
          aggregate: '#6366f1',  // Keep indigo
          event: '#2DD4A7',      // Use Katalyst success green
        },

        // ============================================
        // DARK MODE COLORS
        // ============================================
        dark: {
          bg: {
            primary: '#0B1220',    // Main background
            elevated: '#1A2333',   // Cards, surfaces
            overlay: '#1A2333E5',  // 90% opacity overlay
          },
          border: {
            subtle: '#2E3A4F',
            DEFAULT: '#3A4A63',
            emphasis: '#4A5D73',
          },
          text: {
            primary: '#F7FAFC',
            secondary: '#A8B8CC',
            tertiary: '#6B7C93',
          },
        },

        // ============================================
        // LIGHT MODE COLORS
        // ============================================
        light: {
          bg: {
            primary: '#F7FAFC',
            elevated: '#FFFFFF',
            subtle: '#E5EDF3',
          },
          text: {
            primary: '#1A2333',
            secondary: '#4A5D73',
            tertiary: '#6B7C93',
          },
        },

        // ============================================
        // LEGACY SUPPORT (Deprecated - use foe.* instead)
        // ============================================
        feedback: {
          light: '#4DA3FF',
          DEFAULT: '#4DA3FF',
          dark: '#3B82F6',
        },
        understanding: {
          light: '#7A99B8',
          DEFAULT: '#5C7C99',  // Changed from purple!
          dark: '#4A6B85',
        },
        confidence: {
          light: '#2DD4A7',
          DEFAULT: '#2DD4A7',
          dark: '#22C597',
        },
      },
    },
  },
  plugins: [typography],
}

// const { createGlobPatternsForDependencies } = require('@nx/next/tailwind');

// The above utility import will not work if you are using Next.js' --turbo.
// Instead you will have to manually add the dependent paths to be included.
// For example
// ../libs/buttons/**/*.{ts,tsx,js,jsx,html}',                 <--- Adding a shared lib
// !../libs/buttons/**/*.{stories,spec}.{ts,tsx,js,jsx,html}', <--- Skip adding spec/stories files from shared lib

// If you are **not** using `--turbo` you can uncomment both lines 1 & 19.
// A discussion of the issue can be found: https://github.com/nrwl/nx/issues/26510

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    //     ...createGlobPatternsForDependencies(__dirname)
  ],
  darkMode: 'class', // Added from your new requirements
  theme: {
    extend: {
      colors: {
        // --- Existing Colors ---
        'wira': {
          'teal':         '#0D4F5C',
          'teal-light':   '#1A7A8F',
          'teal-dark':    '#082F38',
          'gold':         '#C8922A',
          'gold-light':   '#E8B84B',
          'gold-dark':    '#8F6419',
          'earth':        '#5C3D2E',
          'earth-light':  '#8A6050',
          'ivory':        '#F5F0E8',
          'ivory-dark':   '#E8E0D0',
          'night':        '#0F1A1C',
        },
        'status': {
          'critical':     '#D72B2B',
          'warning':      '#E8A020',
          'advisory':     '#1B5FA8',
          'safe':         '#2E7D32',
          'offline':      '#616161',
        },
        'dm': {
          'background':   '#0A1214',
          'surface':      '#122029',
          'surface-2':    '#1A2F38',
          'text-primary': '#EDF2F0',
          'text-muted':   '#7A9EA8',
          'border':       '#2A4A54',
        },
        // --- New Colors ---
        'primary':          '#193ce6',
        'accent-red':       '#e61919',
        'asean-red':        '#e61919',
        'asean-yellow':     '#ffcc00',
        'background-light': '#f6f6f8',
        'background-dark':  '#111421',
      },
      fontFamily: {
        // --- Existing Fonts ---
        'display':       ['"Playfair Display"', 'Georgia', 'serif'],
        'body':          ['"IBM Plex Sans"', 'system-ui', 'sans-serif'],
        'mono':          ['"IBM Plex Mono"', 'monospace'],
        // --- New Font (Renamed to prevent overwriting existing 'display') ---
        'asean-display': ['"Space Grotesk"', 'sans-serif'], 
      },
      // --- New Border Radii ---
      borderRadius: {
        'DEFAULT': '0.25rem',
        'lg':      '0.5rem',
        'xl':      '0.75rem',
        'full':    '9999px',
      },
      animation: {
        // --- Existing Animations ---
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-critical': 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in':       'fadeIn 0.3s ease-out forwards',
        'slide-up':      'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        // --- Existing Keyframes ---
        fadeIn:  { from: { opacity: '0' },                              to: { opacity: '1' } },
        slideUp: { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
      },
      spacing: {
        // --- Existing Spacing ---
        'safe-top':      '48px',
        'tap-min':       '44px',
        'tap-emergency': '56px',
      }
    },
  },
  plugins: [
    // --- New Plugins ---
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
};
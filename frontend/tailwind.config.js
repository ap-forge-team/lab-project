import defaultTheme from 'tailwindcss/defaultTheme'
import plugin from 'tailwindcss/plugin'
import primaryTypography from './src/design-system/typography/primary.js'
import fonts from './src/design-system/fonts.js'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        cu: {
          navy: '#1E3A8A',
          blue: '#2563EB',
          sky: '#60A5FA',
          bg: '#EFF6FF',
          surface: '#F1F5F9',
          border: '#CBD5E1',
          body: '#475569',
        },
        surface: {
          DEFAULT: '#F1F5F9',
          light: '#F8FAFC',
        },
        navy: {
          950: '#1E3A8A',
        },
      },
      fontFamily: {
        primary: fonts.primary,
        secondary: fonts.secondary,
        sans: ['"Google Sans"', ...defaultTheme.fontFamily.sans],
        display: ['"Google Sans"', 'sans-serif'],
        serif: ['"Google Sans"', 'sans-serif'],
        mono: ['"Google Sans"', 'sans-serif'],
      },
      fontSize: {
        'display-lg': ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
        'display-md': ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
        'display-sm': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }],
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)',
        'card-hover': '0 8px 24px rgb(37 99 235 / 0.12)',
        panel: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
      },
      spacing: {
        18: '4.5rem',
        88: '22rem',
        128: '32rem',
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities, theme }) {
      const typographyUtilities = {}
      const primaryFont = theme('fontFamily.primary')

      const validateToken = (fontScale, prefix, key, value) => {
        if (typeof value.fontSize !== 'number') {
          throw new Error(
            `Invalid fontSize in type-${fontScale}-${prefix}-${key}: expected number, got ${typeof value.fontSize}`
          )
        }
        if (typeof value.fontWeight !== 'number') {
          throw new Error(
            `Invalid fontWeight in type-${fontScale}-${prefix}-${key}: expected number, got ${typeof value.fontWeight}`
          )
        }
        if (typeof value.lineHeight !== 'number') {
          throw new Error(
            `Invalid lineHeight in type-${fontScale}-${prefix}-${key}: expected number, got ${typeof value.lineHeight}`
          )
        }
      }

      const createUtilities = (group, prefix, fontScale, fontFamily) => {
        Object.entries(group).forEach(([key, value]) => {
          validateToken(fontScale, prefix, key, value)
          const classKey = key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)
          typographyUtilities[`.type-${fontScale}-${prefix}-${classKey}`] = {
            fontFamily: Array.isArray(fontFamily) ? fontFamily.join(', ') : fontFamily,
            fontSize: `${value.fontSize}px`,
            fontWeight: value.fontWeight,
            lineHeight: `${value.lineHeight * 100}%`,
          }
        })
      }

      createUtilities(primaryTypography.body, 'body', 'primary', primaryFont)
      createUtilities(primaryTypography.heading, 'heading', 'primary', primaryFont)
      createUtilities(primaryTypography.label, 'label', 'primary', primaryFont)
      createUtilities(primaryTypography.button, 'button', 'primary', primaryFont)

      addUtilities(typographyUtilities)
    }),
  ],
}

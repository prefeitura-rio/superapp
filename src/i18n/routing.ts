import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['pt', 'en'],

  // Used when no locale matches
  defaultLocale: 'pt',

  // The prefix for the default locale
  localePrefix: {
    mode: 'always'
  }
})

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export type Locale = (typeof routing.locales)[number]
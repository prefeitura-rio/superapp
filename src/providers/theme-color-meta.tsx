'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'

export function ThemeColorMeta() {
  const { theme, systemTheme } = useTheme()

  useEffect(() => {
    // Get the resolved theme (considering system preference)
    const currentTheme = theme === 'system' ? systemTheme : theme

    // Update the theme-color meta tag
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      // Use black status bar for light mode, white for dark mode
      // This creates better contrast
      metaThemeColor.setAttribute(
        'content',
        currentTheme === 'dark' ? '#000000' : '#ffffff'
      )
    }
  }, [theme, systemTheme])

  return null
}

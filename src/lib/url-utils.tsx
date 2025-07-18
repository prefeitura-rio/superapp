import type React from 'react'

/**
 * Converts URLs in text to clickable links
 * @param text - The text containing URLs
 * @returns JSX elements with clickable links
 */
export function convertUrlsToLinks(text: string): React.ReactNode[] {
  if (!text) return [text]

  // URL regex pattern that matches http/https URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 underline"
        >
          {part}
        </a>
      )
    }
    return part
  })
}

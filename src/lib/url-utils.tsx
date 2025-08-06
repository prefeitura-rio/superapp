import type React from 'react'

/**
 * Ensures a URL has the proper protocol (https://) if it doesn't already have one
 * @param url - The URL to normalize
 * @returns The URL with proper protocol
 */
export function ensureUrlProtocol(url: string): string {
  if (!url) return url

  // If the URL already has a protocol, return it as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // If the URL starts with //, it's a protocol-relative URL, add https:
  if (url.startsWith('//')) {
    return `https:${url}`
  }

  // Otherwise, add https:// to the beginning
  return `https://${url}`
}

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

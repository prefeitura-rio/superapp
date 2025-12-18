'use client'

import { memo } from 'react'

export type ContentPart = {
  type: 'text' | 'video-title' | 'link'
  content: string
  href?: string
}

export type FaqSection = {
  id: string
  title: string
  content: string
}

export function parseContent(text: string): ContentPart[] {
  const parts: ContentPart[] = []
  const videoTitleRegex = /"([^"]+)"/g // Picks up the text between double quotes
  const urlRegex = /(https?:\/\/[^\s]+)/g // Picks urls

  let lastIndex = 0
  const matches: Array<{ type: 'video' | 'url'; match: RegExpExecArray }> = []

  let videoMatch = videoTitleRegex.exec(text)
  while (videoMatch !== null) {
    matches.push({ type: 'video', match: videoMatch })
    videoMatch = videoTitleRegex.exec(text)
  }

  let urlMatch = urlRegex.exec(text)
  while (urlMatch !== null) {
    matches.push({ type: 'url', match: urlMatch })
    urlMatch = urlRegex.exec(text)
  }

  matches.sort((a, b) => a.match.index - b.match.index)

  for (const { type, match } of matches) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, match.index),
      })
    }

    if (type === 'video') {
      parts.push({
        type: 'video-title',
        content: match[1],
      })
    } else {
      parts.push({
        type: 'link',
        content: match[0],
        href: match[0],
      })
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    })
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }]
}

export const FormattedContent = memo(({ content }: { content: string }) => {
  const parts = parseContent(content)

  return (
    <p className="text-foreground-light text-sm leading-relaxed whitespace-pre-line opacity-50">
      {parts.map((part, i) => {
        if (part.type === 'video-title') {
          return (
            <span key={i} className="italic opacity-100">
              "{part.content}"
            </span>
          )
        }
        if (part.type === 'link') {
          return (
            <a
              key={i}
              href={part.href}
              target="_blank"
              rel="noopener noreferrer"
              className="italic underline opacity-100 hover:opacity-80 transition-opacity"
            >
              {part.content}
            </a>
          )
        }
        return <span key={i}>{part.content}</span>
      })}
    </p>
  )
})

FormattedContent.displayName = 'FormattedContent'

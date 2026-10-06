'use client'

import { memo } from 'react'
import { cn } from './utils'

export type ContentPart = {
  type: 'text' | 'video-title' | 'link' | 'bold'
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
  const boldRegex = /\*\*([^*]+)\*\*/g // Picks bold text

  let lastIndex = 0
  const matches: Array<{
    type: 'video' | 'url' | 'bold'
    match: RegExpExecArray
  }> = []

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

  let boldMatch = boldRegex.exec(text)
  while (boldMatch !== null) {
    matches.push({ type: 'bold', match: boldMatch })
    boldMatch = boldRegex.exec(text)
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
    } else if (type === 'bold') {
      parts.push({
        type: 'bold',
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

export function Highlighted({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-neutral-200 dark:bg-neutral-700 rounded-sm px-0.5 text-inherit not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

function highlightText(text: string, query: string) {
  if (!query) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark
            key={i}
            className="bg-neutral-200 dark:bg-neutral-700 rounded-sm px-0.5 text-inherit not-italic"
          >
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  )
}

export const FormattedContent = memo(
  ({
    content,
    className,
    query,
  }: {
    content: string
    className?: string
    query?: string
  }) => {
    const parts = parseContent(content)

    return (
      <p
        className={cn(
          'text-foreground text-sm leading-relaxed whitespace-pre-line opacity-50',
          className
        )}
      >
        {parts.map((part, i) => {
          if (part.type === 'video-title') {
            return (
              <span key={i} className="italic opacity-100">
                &ldquo;
                {query ? highlightText(part.content, query) : part.content}
                &rdquo;
              </span>
            )
          }
          if (part.type === 'bold') {
            return (
              <span key={i} className="font-semibold opacity-100">
                {query ? highlightText(part.content, query) : part.content}
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
                {query ? highlightText(part.content, query) : part.content}
              </a>
            )
          }
          return (
            <span key={i}>
              {query ? highlightText(part.content, query) : part.content}
            </span>
          )
        })}
      </p>
    )
  }
)

FormattedContent.displayName = 'FormattedContent'

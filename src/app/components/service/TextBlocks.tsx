'use client'

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useState } from 'react'

interface TextBlockProps {
  title: string
  content: string | string[]
  renderMarkdown: (content: string) => React.ReactNode
}

const MAX_CHARS = 500

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text

  let truncated = text.slice(0, maxLength)

  const lastSpace = truncated.lastIndexOf(' ')
  if (lastSpace > 0) {
    truncated = truncated.slice(0, lastSpace)
  }

  return truncated
}

export function TextBlock({ title, content, renderMarkdown }: TextBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const contentString =
    typeof content === 'string'
      ? content
      : content.length === 1
        ? // If array has only 1 item, check if it's markdown (contains newlines or list markers)
          // If it's markdown, don't remove the leading "- " as it might be part of a list
          // Only remove if it's a single line item
          (() => {
            const item = content[0].trim()
            // If it contains newlines or starts with list markers, it's likely markdown - keep as is
            if (item.includes('\n') || item.match(/^[-*]\s/) || item.match(/^\d+\.\s/) || item.match(/^- \[[ x]\]/)) {
              return item
            }
            // Otherwise, it's a simple single item - remove leading "- " if present
            return item.replace(/^-\s*/, '')
          })()
        : // If array has multiple items, add bullet points
          content
            .map(item => {
              // Remove leading "- " or "-" if it exists
              const cleanedItem = item.trim().replace(/^-\s*/, '')
              return `• ${cleanedItem}`
            })
            .join('\n')

  const shouldTruncate = contentString.length > MAX_CHARS
  const truncatedContent = shouldTruncate
    ? `${truncateText(contentString, MAX_CHARS)}...`
    : contentString

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <div className="bg-card rounded-2xl p-6 w-full">
        <h3 className="text-foreground font-medium text-base mb-5">{title}</h3>

        <div className="text-terciary-foreground text-sm">
          {shouldTruncate ? (
            !isExpanded ? (
              <div className="relative">
                {renderMarkdown(truncatedContent)}
                {/* Fade effect */}
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent pointer-events-none" />
              </div>
            ) : (
              <CollapsibleContent>
                {renderMarkdown(contentString)}
              </CollapsibleContent>
            )
          ) : (
            renderMarkdown(contentString)
          )}
        </div>

        {/* 'Ver mais/Ver menos' */}
        {shouldTruncate && (
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="mt-4 bg-secondary text-foreground py-[6px] px-4 rounded-2xl hover:bg-secondary/80 transition-colors text-sm cursor-pointer"
            >
              {isExpanded ? 'Ver menos' : 'Ver mais'}
            </button>
          </CollapsibleTrigger>
        )}
      </div>
    </Collapsible>
  )
}

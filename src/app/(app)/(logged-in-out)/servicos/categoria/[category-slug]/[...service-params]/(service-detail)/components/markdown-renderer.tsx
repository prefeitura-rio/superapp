'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface MarkdownRendererProps {
  content: string
  className?: string
}

// Normalize markdown content by removing spaces inside bold/italic markers
function normalizeMarkdown(content: string): string {
  return (
    content
      // Move trailing spaces before closing bold markers to outside: **text **next -> **text** next
      // This handles cases where there's text after the closing marker
      .replace(/\*\*([^*\n]+?)\s+\*\*([^\s])/g, '**$1** $2')
      // Remove trailing spaces before closing bold markers (end of text or followed by whitespace): **text ** -> **text**
      .replace(/\*\*([^*\n]+?)\s+\*\*/g, '**$1**')
      // Move trailing spaces before closing bold italic markers to outside: ***text ***next -> ***text*** next
      .replace(/\*\*\*([^*\n]+?)\s+\*\*\*([^\s])/g, '***$1*** $2')
      // Remove trailing spaces before closing bold italic markers: ***text *** -> ***text***
      .replace(/\*\*\*([^*\n]+?)\s+\*\*\*/g, '***$1***')
      // Move trailing spaces before closing italic markers to outside: *text *next -> *text* next
      .replace(/(?<!\*)\*([^*\n]+?)\s+\*([^\s])(?!\*)/g, '*$1* $2')
      // Remove trailing spaces before closing italic markers: *text * -> *text*
      .replace(/(?<!\*)\*([^*\n]+?)\s+\*(?!\*)/g, '*$1*')
  )
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  const normalizedContent = normalizeMarkdown(content)

  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customizar componentes se necessário
          a: ({ node, ...props }) => (
            <a
              {...props}
              className="text-primary underline hover:no-underline"
              target="_blank"
              rel="noopener noreferrer"
            />
          ),
          p: ({ node, ...props }) => (
            <p {...props} className="text-sm text-foreground-light leading-5" />
          ),
          ul: ({ node, ...props }) => (
            <ul {...props} className="list-disc pl-6 space-y-1" />
          ),
          ol: ({ node, ...props }) => (
            <ol {...props} className="list-decimal pl-6 space-y-1" />
          ),
          li: ({ node, ...props }) => (
            <li
              {...props}
              className="text-sm text-foreground-light leading-5"
            />
          ),
          strong: ({ node, ...props }) => (
            <strong {...props} className="font-semibold text-foreground" />
          ),
          em: ({ node, ...props }) => <em {...props} className="italic" />,

          code: ({ node, className, children, ...props }) => {
            const isInline = !className
            if (isInline) {
              return (
                <code
                  {...props}
                  className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
                >
                  {children}
                </code>
              )
            }
            return (
              <code
                {...props}
                className={`${className} block bg-muted p-4 rounded-lg overflow-x-auto`}
              >
                {children}
              </code>
            )
          },
          blockquote: ({ node, ...props }) => (
            <blockquote
              {...props}
              className="border-l-4 border-border pl-4 italic text-foreground-light"
            />
          ),
          input: ({ node, ...props }) => {
            // Para checkboxes em task lists
            if (props.type === 'checkbox') {
              return <input {...props} disabled className="mr-2 align-middle" />
            }
            return <input {...props} />
          },
        }}
      >
        {normalizedContent}
      </ReactMarkdown>
    </div>
  )
}

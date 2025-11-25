import { MarkdownViewer } from '@/components/blocks/editor-md/markdown-viewer'

interface MarkdownRendererProps {
  content: string
  className?: string
}

export function MarkdownRenderer({
  content,
  className = '',
}: MarkdownRendererProps) {
  return <MarkdownViewer content={content} className={className} />
}

import { cn } from '@/lib/utils'

interface ServiceHtmlContentProps {
  /** Already sanitized Carta de Serviços HTML. */
  content: string
  className?: string
}

export function ServiceHtmlContent({
  content,
  className,
}: ServiceHtmlContentProps) {
  if (!content.trim()) return null

  return (
    <div
      className={cn('carta-servico-html prose max-w-none', className)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

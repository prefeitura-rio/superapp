import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type AccessibilityTypes, accessibilityLabel } from '@/types/course'

interface AccessibilityBadgeProps {
  accessibility?: AccessibilityTypes | undefined | ''
  className?: string
}

export function AccessibilityBadge({
  accessibility,
  className,
}: AccessibilityBadgeProps) {
  const text = accessibility ? accessibilityLabel[accessibility] || '' : ''

  if (!text || !accessibility) {
    return null
  }

  return (
    <Badge className={cn('text-background bg-primary', className)}>
      {text}
    </Badge>
  )
}

export const IsExternalPartnerBadge = ({
  className,
}: { className?: string }) => {
  return (
    <Badge className={cn('text-white bg-card-5', className)}>
      Curso Externo
    </Badge>
  )
}

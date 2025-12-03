import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type AccessibilityTypes, accessibilityLabel } from '@/types/course'

interface AccessibilityBadgeProps {
  accessibility?: AccessibilityTypes | string | undefined | ''
  className?: string
}

export function AccessibilityBadge({
  accessibility,
  className,
}: AccessibilityBadgeProps) {
  // Normalize the accessibility value to match AccessibilityTypes
  const normalizedAccessibility = accessibility
    ? (accessibility.toUpperCase().trim() as AccessibilityTypes)
    : undefined

  // Only show badge for ACESSIVEL or EXCLUSIVO
  if (
    !normalizedAccessibility ||
    (normalizedAccessibility !== 'ACESSIVEL' &&
      normalizedAccessibility !== 'EXCLUSIVO')
  ) {
    return null
  }

  const text = accessibilityLabel[normalizedAccessibility]

  if (!text) {
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

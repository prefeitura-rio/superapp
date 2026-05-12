import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { type AccessibilityTypes, accessibilityLabel } from '@/types/course'
import {
  Accessibility,
  Briefcase,
  Clock,
  DollarSign,
  MapPin,
} from 'lucide-react'

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

// --- Pill badges for horizontal card variant ---

function CoursePillBadge({
  icon: Icon,
  label,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 bg-card rounded-full px-2 py-0.5 text-xs text-foreground-light transition-colors duration-200',
        className
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </span>
  )
}

function getModalityLabel(modality: string | undefined): string | null {
  if (!modality) return null
  const m = modality.toUpperCase().trim()
  if (m === 'PRESENCIAL') return 'Presencial'
  if (m === 'SEMIPRESENCIAL' || m === 'HIBRIDO') return 'Híbrido'
  if (m === 'REMOTO' || m === 'ONLINE' || m === 'LIVRE_FORMACAO_ONLINE')
    return 'Remoto'
  return modality
}

export function ModalityBadge({
  modality,
  className,
}: { modality?: string; className?: string }) {
  const label = getModalityLabel(modality)
  if (!label) return null
  return (
    <CoursePillBadge icon={Briefcase} label={label} className={className} />
  )
}

export function WorkloadBadge({
  workload,
  className,
}: { workload?: string; className?: string }) {
  if (!workload) return null
  return <CoursePillBadge icon={Clock} label={workload} className={className} />
}

export function ScholarshipBadge({ className }: { className?: string }) {
  return (
    <CoursePillBadge icon={DollarSign} label="Bolsa" className={className} />
  )
}

export function NeighborhoodBadge({
  neighborhood,
  className,
}: { neighborhood?: string; className?: string }) {
  if (!neighborhood) return null
  return (
    <CoursePillBadge icon={MapPin} label={neighborhood} className={className} />
  )
}

export function AccessibilityPillBadge({
  accessibility,
  className,
}: { accessibility?: AccessibilityTypes | string | ''; className?: string }) {
  const normalized = accessibility
    ? (accessibility.toUpperCase().trim() as AccessibilityTypes)
    : undefined

  if (
    !normalized ||
    (normalized !== 'ACESSIVEL' && normalized !== 'EXCLUSIVO')
  ) {
    return null
  }

  const label = accessibilityLabel[normalized]
  if (!label) return null

  return (
    <CoursePillBadge icon={Accessibility} label={label} className={className} />
  )
}

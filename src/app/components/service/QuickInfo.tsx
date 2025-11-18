'use client'

import { ChevronRight, Clock, Coins, LandmarkIcon, Tag } from 'lucide-react'
import type { ReactNode } from 'react'

interface QuickInfoItemProps {
  icon: ReactNode
  label: string
  value: string
  showArrow?: boolean
  onClick?: () => void
  layout?: 'row' | 'column' // Novo: controla o layout
}

function QuickInfoItem({
  icon,
  label,
  value,
  showArrow = false,
  onClick,
  layout = 'column',
}: QuickInfoItemProps) {
  const Component = onClick ? 'button' : 'div'
  const interactiveClasses = onClick
    ? 'cursor-pointer hover:bg-card/80 transition-colors focus:outline-none'
    : ''

  if (layout === 'row') {
    // Row layout: ícone + label + valor
    return (
      <Component
        type={onClick ? 'button' : undefined}
        onClick={onClick}
        className={`flex items-center gap-4 bg-card rounded-2xl p-4 w-full ${interactiveClasses}`}
      >
        {/* Icon */}
        <div className="flex-shrink-0 text-foreground">{icon}</div>

        {/* Label */}
        <span className="text-xs text-foreground-light flex-shrink-0 leading-4">
          {label}
        </span>

        {/* Value */}
        <span className="text-sm text-primary font-normal ml-auto leading-5">
          {value}
        </span>

        {/* Arrow (optional) */}
        {showArrow && (
          <ChevronRight className="w-5 h-5 text-foreground-light flex-shrink-0" />
        )}
      </Component>
    )
  }

  // Column layout: icon + (label/valor)
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex items-center gap-4 bg-card rounded-2xl p-4 w-full ${interactiveClasses}`}
    >
      <div className="flex-shrink-0 text-foreground">{icon}</div>

      <div className="flex flex-col flex-1 min-w-0">
        <span className="text-xs text-foreground-light">{label}</span>
        <span className="text-sm text-primary font-normal leading-5 truncate">
          {value}
        </span>
      </div>

      {showArrow && (
        <ChevronRight className="w-5 h-5 text-foreground-light flex-shrink-0" />
      )}
    </Component>
  )
}

interface QuickInfoCostProps {
  value: string
}

export function QuickInfoCost({ value }: QuickInfoCostProps) {
  return (
    <QuickInfoItem
      icon={<Coins className="w-5 h-5 text-foreground-light" />}
      label="Custo"
      value={value}
      layout="row"
    />
  )
}

interface QuickInfoTimeProps {
  value: string
}

export function QuickInfoTime({ value }: QuickInfoTimeProps) {
  return (
    <QuickInfoItem
      icon={<Clock className="w-5 h-5 text-foreground-light" />}
      label="Tempo de atendimento"
      value={value}
      layout="row"
    />
  )
}

interface QuickInfoCategoryProps {
  value: string
}

export function QuickInfoCategory({ value }: QuickInfoCategoryProps) {
  return (
    <QuickInfoItem
      icon={<Tag className="w-5 h-5 text-foreground-light" />}
      label="Categoria"
      value={value}
      layout="row"
    />
  )
}

interface QuickInfoDepartmentProps {
  value: string
}

export function QuickInfoDepartment({ value }: QuickInfoDepartmentProps) {
  return (
    <QuickInfoItem
      icon={<LandmarkIcon className="w-5 h-5 text-foreground-light" />}
      label="Órgão gestor"
      value={value}
    />
  )
}

interface QuickInfoProps {
  children: ReactNode
}

// Wrapper component for QuickInfo items
export function QuickInfo({ children }: QuickInfoProps) {
  return <div className="flex flex-col gap-2">{children}</div>
}

'use client'

import { ChevronLeftIcon, ChevronRightIcon } from '@/assets/icons'
import { type PaginationItem, getPaginationItems } from '@/lib/pagination'
import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

function PaginationButton({
  children,
  isActive = false,
  disabled = false,
  onClick,
  'aria-label': ariaLabel,
  'aria-current': ariaCurrent,
}: {
  children: ReactNode
  isActive?: boolean
  disabled?: boolean
  onClick?: () => void
  'aria-label'?: string
  'aria-current'?: 'page' | undefined
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={ariaCurrent}
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full text-sm leading-5 font-normal transition-colors',
        'disabled:pointer-events-none disabled:opacity-50',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'bg-card text-foreground hover:bg-secondary'
      )}
    >
      {children}
    </button>
  )
}

function PaginationControls({
  page,
  totalPages,
  onPageChange,
  variant,
  className,
}: PaginationProps & { variant: 'mobile' | 'desktop' }) {
  const items = getPaginationItems(page, totalPages, variant)
  const isFirstPage = page <= 1
  const isLastPage = page >= totalPages

  return (
    <nav
      aria-label="Paginação"
      className={cn('flex items-center justify-center gap-2', className)}
    >
      {!isFirstPage && (
        <PaginationButton
          aria-label="Página anterior"
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeftIcon className="size-5 text-foreground" />
        </PaginationButton>
      )}

      {items.map((item: PaginationItem, index) => {
        if (item === 'ellipsis') {
          return (
            <PaginationButton
              key={`ellipsis-${index}`}
              disabled
              aria-label="Mais páginas"
            >
              ...
            </PaginationButton>
          )
        }

        const isActive = item === page
        return (
          <PaginationButton
            key={item}
            isActive={isActive}
            aria-label={`Página ${item}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </PaginationButton>
        )
      })}

      {!isLastPage && (
        <PaginationButton
          aria-label="Próxima página"
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRightIcon className="size-5 text-foreground" />
        </PaginationButton>
      )}
    </nav>
  )
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className={cn('w-full', className)}>
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="mobile"
        className="md:hidden"
      />
      <PaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={onPageChange}
        variant="desktop"
        className="hidden md:flex"
      />
    </div>
  )
}

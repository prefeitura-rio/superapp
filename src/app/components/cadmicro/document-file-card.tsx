'use client'

import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import type { ReactNode } from 'react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

interface DocumentFileCardProps {
  fileName: string
  sizeLabel: string
  thumbnail: ReactNode
  onClick?: () => void
  disabled?: boolean
  busy?: boolean
  busyLabel?: string
  /** When set, clicking the main area opens an in-app image lightbox. */
  photoSrc?: string
  actions?: ReactNode
  className?: string
  'aria-label'?: string
}

export function DocumentFileCard({
  fileName,
  sizeLabel,
  thumbnail,
  onClick,
  disabled = false,
  busy = false,
  busyLabel = 'Abrindo...',
  photoSrc,
  actions,
  className,
  'aria-label': ariaLabel,
}: DocumentFileCardProps) {
  const isDisabled = disabled || busy
  const label = ariaLabel ?? `Visualizar ${fileName}`

  const content = (
    <>
      <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-card">
        {busy ? (
          <Loader2 className="size-5 animate-spin text-foreground" />
        ) : (
          thumbnail
        )}
      </div>
      <div className="flex min-w-0 flex-col text-sm leading-5">
        <span className="truncate text-foreground">{fileName}</span>
        {(busy || sizeLabel) && (
          <span className="text-foreground-light">
            {busy ? busyLabel : sizeLabel}
          </span>
        )}
      </div>
    </>
  )

  const trigger = (
    <button
      type="button"
      onClick={photoSrc ? undefined : onClick}
      disabled={isDisabled}
      className="flex min-w-0 flex-1 cursor-pointer items-center gap-4 text-left transition-opacity disabled:cursor-not-allowed disabled:opacity-70"
      aria-label={label}
    >
      {content}
    </button>
  )

  return (
    <div
      className={cn(
        'flex w-full items-center gap-1 rounded-xl bg-secondary p-4',
        className
      )}
    >
      {photoSrc && !isDisabled ? (
        <div className="min-w-0 flex-1">
          <PhotoProvider>
            <PhotoView src={photoSrc}>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center gap-4 text-left"
                aria-label={label}
              >
                {content}
              </button>
            </PhotoView>
          </PhotoProvider>
        </div>
      ) : (
        trigger
      )}
      {actions ? (
        <div className="relative z-10 flex shrink-0 items-center gap-1">
          {actions}
        </div>
      ) : null}
    </div>
  )
}

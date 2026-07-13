'use client'

import { AiImproveIcon } from '@/assets/icons'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type * as React from 'react'

type AiImproveButtonMode = 'improve' | 'revert'

interface AiImproveButtonProps
  extends Omit<
    React.ComponentProps<typeof Button>,
    'variant' | 'size' | 'children'
  > {
  mode?: AiImproveButtonMode
  /** When mode is "improve", controls idle vs ready styling. */
  isReady?: boolean
  /** Label when mode is "improve". Defaults to "Melhorar com IA". */
  label?: string
}

export function AiImproveButton({
  mode = 'improve',
  isReady = false,
  label = 'Melhorar com IA',
  className,
  disabled,
  ...props
}: AiImproveButtonProps) {
  const isRevert = mode === 'revert'
  const isIdle = !isRevert && !isReady

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={disabled || isIdle}
      className={cn(
        'h-auto cursor-pointer gap-3 rounded-full bg-card px-4 py-1.5 text-xs font-normal shadow-none has-[>svg]:px-4',
        'hover:bg-card/70 focus-visible:ring-0',
        isRevert || isReady
          ? 'border border-border text-foreground-light hover:text-foreground-light'
          : 'border-0 text-muted-foreground hover:text-muted-foreground disabled:opacity-100',
        className
      )}
      {...props}
    >
      {isRevert ? (
        <>
          <ArrowLeft className="size-3.5" aria-hidden />
          Voltar ao original
        </>
      ) : (
        <>
          <AiImproveIcon className="size-[15px]" />
          {label}
        </>
      )}
    </Button>
  )
}

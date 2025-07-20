'use client'

import { cn } from '@/lib/utils'
import type React from 'react'

interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ElementType
}

export function IconButton({
  icon: Icon,
  className,
  ...props
}: IconButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        'flex items-center justify-center cursor-pointer',
        className
      )}
      {...props}
    >
      <span className="flex items-center justify-center bg-card rounded-full w-11 h-11">
        <Icon className="h-5 w-5 text-foreground" />
      </span>
    </button>
  )
}

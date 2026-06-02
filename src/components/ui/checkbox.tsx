'use client'

import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'group relative shrink-0 size-[22px] outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      {...props}
    >
      {/* Unchecked: escondido quando marcado via group-data */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        className="absolute inset-0 group-data-[state=checked]:hidden"
        aria-hidden
      >
        <rect
          x="0.5"
          y="0.5"
          width="21"
          height="21"
          rx="3.5"
          stroke="#A1A1A1"
        />
      </svg>

      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center transition-none"
      >
        {/* Checked: fundo primary + checkmark fino */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
        >
          <rect width="22" height="22" rx="4" fill="var(--primary)" />
          <path
            d="M4.5 11.375L7.875 14.75L15.875 7"
            stroke="#F9FAFB"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }

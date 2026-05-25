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
        <path
          d="M20.75 2.75V18.5C20.75 19.0967 20.5129 19.669 20.091 20.091C19.669 20.5129 19.0967 20.75 18.5 20.75H2.75C2.15326 20.75 1.58097 20.5129 1.15901 20.091C0.737053 19.669 0.5 19.0967 0.5 18.5V2.75C0.5 2.15326 0.737053 1.58097 1.15901 1.15901C1.58097 0.737053 2.15326 0.5 2.75 0.5L18.5 0.5"
          stroke="#A1A1A1"
          strokeLinecap="round"
          strokeLinejoin="round"
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

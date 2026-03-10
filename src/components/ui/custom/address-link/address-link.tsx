'use client'

import {
  buildGoogleMapsUrl,
  isValidMappableAddress,
} from '@/lib/google-maps-utils'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'
import type React from 'react'

export interface AddressLinkProps {
  /**
   * The address string to create a Google Maps link for
   */
  address: string

  /**
   * The content to wrap (usually the address display)
   */
  children: React.ReactNode

  /**
   * Optional className for styling
   */
  className?: string

  /**
   * Show external link icon on hover
   * @default false
   */
  showExternalIcon?: boolean

  /**
   * Custom aria-label for accessibility
   */
  ariaLabel?: string
}

/**
 * AddressLink - Wrapper component that transforms address text into clickable Google Maps links
 *
 * @example
 * ```tsx
 * <AddressLink address="Rua Brasil, 100, Rio de Janeiro">
 *   <span>Rua Brasil, 100, Rio de Janeiro</span>
 * </AddressLink>
 * ```
 *
 * Features:
 * - Validates address before creating link
 * - Opens Google Maps in new tab
 * - Accessible (ARIA labels, keyboard navigation)
 * - Prevents parent click propagation
 * - Falls back to plain text if address is invalid
 *
 * @param props - Component props
 * @returns React element with link wrapper or plain children
 */
export function AddressLink({
  address,
  children,
  className,
  showExternalIcon = false,
  ariaLabel,
}: AddressLinkProps) {
  const mapsUrl = buildGoogleMapsUrl(address)
  const isLinkable = isValidMappableAddress(address)

  // If address is not valid for mapping, render children as-is
  if (!isLinkable || !mapsUrl) {
    return <>{children}</>
  }

  const defaultAriaLabel = `Abrir ${address} no Google Maps`

  return (
    <a
      href={mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center gap-2 transition-colors',
        'hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded',
        className
      )}
      aria-label={ariaLabel || defaultAriaLabel}
      onClick={e => e.stopPropagation()} // Prevent parent button clicks
    >
      {children}
      {showExternalIcon && (
        <ExternalLink
          className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
          aria-hidden="true"
        />
      )}
    </a>
  )
}

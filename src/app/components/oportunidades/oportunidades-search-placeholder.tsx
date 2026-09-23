'use client'

import { SearchIcon } from '@/assets/icons'
import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'

interface OportunidadesSearchPlaceholderProps {
  searchUrl: string
  gaEvent?: string
}

export function OportunidadesSearchPlaceholder({
  searchUrl,
  gaEvent,
}: OportunidadesSearchPlaceholderProps) {
  const handleClick = () => {
    if (gaEvent) {
      sendGAEvent('event', gaEvent, {
        event_timestamp: new Date().toISOString(),
      })
    }
  }

  return (
    <Link href={searchUrl} className="block px-4" onClick={handleClick}>
      <div
        className="flex items-center justify-between rounded-full bg-background px-4 py-4"
        style={{ boxShadow: '0 4px 12px 0 rgba(0, 0, 0, 0.05)' }}
      >
        <SearchIcon className="h-6 w-6 text-card-foreground" />
        <span className="text-muted-foreground text-sm flex-1 ml-4">
          O que você precisa?
        </span>
      </div>
    </Link>
  )
}

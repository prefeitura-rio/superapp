'use client'

import { SearchIcon } from '@/assets/icons'
import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'

interface SearchPlaceholderProps {
  isCourseSearch?: boolean
  searchUrl?: string
}

export default function SearchPlaceholder({
  isCourseSearch = false,
  searchUrl,
}: SearchPlaceholderProps) {
  const handleSearchClick = () => {
    if (!isCourseSearch) {
      sendGAEvent('event', 'home_search_input_click', {
        event_timestamp: new Date().toISOString(),
      })
    }
  }

  const resolvedUrl =
    searchUrl ?? (isCourseSearch ? '/servicos/cursos/busca' : '/busca')

  return (
    <div className="px-4 mb-2">
      <Link href={resolvedUrl} className="block">
        <div
          className="flex items-center space-x-4 bg-card rounded-full px-4 py-4"
          onClick={handleSearchClick}
        >
          <SearchIcon className="h-6 w-6 text-card-foreground" />
          <span className="text-muted-foreground text-sm flex-1">
            Do que você precisa?
          </span>
        </div>
      </Link>
    </div>
  )
}

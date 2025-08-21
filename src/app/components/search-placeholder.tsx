import { SearchIcon } from '@/assets/icons'
import { sendGAEvent } from '@next/third-parties/google'
import Link from 'next/link'

export default function SearchPlaceholder() {
  const handleSearchClick = () => {
    sendGAEvent('event', 'home_search_input_click', {
      event_timestamp: new Date().toISOString(),
    })
  }

  return (
    <div className="px-4 mb-2">
      <Link href="/busca" className="block">
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

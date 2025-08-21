import { SearchIcon } from '@/assets/icons'
import Link from 'next/link'

export function SearchButton() {
  return (
    <Link href="/busca" className="rounded-full p-3 bg-card">
      <SearchIcon className="text-foreground h-5 w-5" />
      <span className="sr-only">Busca</span>
    </Link>
  )
}

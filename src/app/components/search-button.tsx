import { SearchIcon } from '@/assets/icons'
import Link from 'next/link'

interface SearchButtonProps {
  href?: string
}

export function SearchButton({ href = '/busca' }: SearchButtonProps) {
  return (
    <Link href={href} className="rounded-full">
      <SearchIcon className="text-foreground h-5 w-5" />
      <span className="sr-only">Busca</span>
    </Link>
  )
}

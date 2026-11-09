'use client'

import { SearchIcon, XIcon } from '@/assets/icons'
import { MenuItem } from '@/components/ui/custom/menu-item'
import { SearchInput } from '@/components/ui/custom/search-input'
import {
  type TermosDeUsoPlatform,
  buildTermosDeUsoHref,
  filterTermosDeUsoPlatforms,
} from '@/constants/termos-de-uso/platforms'
import { useRef, useState } from 'react'

interface PlatformListProps {
  platforms: readonly TermosDeUsoPlatform[]
}

export function PlatformList({ platforms }: PlatformListProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const visiblePlatforms = filterTermosDeUsoPlatforms(platforms, query)

  function clearSearch() {
    setQuery('')
    inputRef.current?.focus()
  }

  return (
    <>
      <div
        role="search"
        className="mt-6 flex h-14 items-center gap-4 rounded-full bg-card px-4"
      >
        <SearchIcon
          className="h-6 w-6 shrink-0 text-card-foreground"
          aria-hidden="true"
        />
        {/* O X nativo do `type="search"` (azul no Chrome) fica escondido em
            favor do X do design system abaixo. */}
        <SearchInput
          ref={inputRef}
          type="search"
          showIcons={false}
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="O que você precisa?"
          aria-label="Buscar plataforma"
          enterKeyHint="search"
          className="h-full flex-1 bg-transparent px-0 [&_input::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            aria-label="Limpar busca"
            className="shrink-0 rounded-full text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <XIcon
              className="h-6 w-6 text-card-foreground"
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <nav aria-label="Plataformas" className="mt-2">
        {visiblePlatforms.length > 0 ? (
          <ul>
            {visiblePlatforms.map((platform, index) => (
              <li key={platform.slug}>
                <MenuItem
                  icon={null}
                  label={platform.name}
                  href={buildTermosDeUsoHref(platform.slug)}
                  isLast={index === visiblePlatforms.length - 1}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p role="status" className="py-5 text-sm text-foreground-light">
            Nenhuma plataforma encontrada para “{query.trim()}”.
          </p>
        )}
      </nav>
    </>
  )
}

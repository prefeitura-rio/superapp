'use client'

import { ChevronLeftIcon } from '@/assets/icons/chevron-left-icon'
import { ChevronRightIcon } from '@/assets/icons/chevron-right-icon'
import { MenuIcon } from '@/assets/icons/menu-icon'
import { SearchIcon } from '@/assets/icons/search-icon'
import { XIcon } from '@/assets/icons/x-icon'
import { IconButton } from '@/components/ui/custom/icon-button'
import {
  ALL_FAQ_ITEMS,
  FAQ_SOURCE_LABELS,
  type FaqSource,
} from '@/constants/faqs'
import { FormattedContent, Highlighted } from '@/lib/faq-utils'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

function useDebounce(value: string, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

const SOURCE_ORDER: FaqSource[] = ['prefrio', 'cursos', 'trabalho']

const SOURCE_HREF: Record<FaqSource, string> = {
  prefrio: '/faq/prefrio?from=faq',
  cursos: '/faq/cursos?from=faq',
  trabalho: '/faq/trabalho?from=faq',
}

const NAV_ITEMS: { label: string; href: string }[] = [
  { label: FAQ_SOURCE_LABELS.prefrio, href: SOURCE_HREF.prefrio },
  { label: FAQ_SOURCE_LABELS.cursos, href: SOURCE_HREF.cursos },
  { label: FAQ_SOURCE_LABELS.trabalho, href: SOURCE_HREF.trabalho },
]

export default function FaqHubPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(() => searchParams.get('q') ?? '')
  const [headerH, setHeaderH] = useState(64)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query)
  const isSearching = query.length > 0 && debouncedQuery !== query
  const hasQuery = debouncedQuery.trim().length > 0

  useEffect(() => {
    fetch('/api/user/header', { credentials: 'include' })
      .then(r => (r.ok ? r.json() : { isLoggedIn: false }))
      .then(d => setIsLoggedIn(d.isLoggedIn ?? false))
      .catch(() => {})
  }, [])

  // sync debounced query → URL without looping.
  // router and searchParams are stable refs — storing them avoids listing as deps.
  const routerRef = useRef(router)
  const searchParamsRef = useRef(searchParams)
  routerRef.current = router
  searchParamsRef.current = searchParams

  useEffect(() => {
    const sp = searchParamsRef.current
    const next = debouncedQuery.trim()
    if (next === (sp.get('q') ?? '')) return
    const params = new URLSearchParams(sp.toString())
    if (next) {
      params.set('q', next)
    } else {
      params.delete('q')
    }
    routerRef.current.replace(`/faq?${params.toString()}`, { scroll: false })
  }, [debouncedQuery])

  useEffect(() => {
    const headerEl = document.querySelector(
      '[data-faq-hub-header]'
    ) as HTMLElement
    if (!headerEl) return
    const update = () => setHeaderH(headerEl.offsetHeight)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(headerEl)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  const results = useMemo(() => {
    if (!hasQuery) return []
    const q = normalize(debouncedQuery.trim())
    return ALL_FAQ_ITEMS.filter(
      item =>
        normalize(item.title).includes(q) || normalize(item.content).includes(q)
    )
  }, [debouncedQuery, hasQuery])

  const groups = useMemo(() => {
    if (!results.length) return []
    return SOURCE_ORDER.flatMap(source => {
      const items = results.filter(r => r.source === source)
      if (!items.length) return []
      return [{ source, label: FAQ_SOURCE_LABELS[source], items }]
    })
  }, [results])

  return (
    <main
      className="max-w-4xl min-h-lvh mx-auto text-foreground pb-10"
      style={{ paddingTop: headerH }}
    >
      {/* header fixo — botão de voltar + hamburguer (só quando logado) */}
      <header
        data-faq-hub-header
        className="fixed top-0 left-0 right-0 z-50 bg-background max-w-4xl mx-auto px-4 py-4 md:py-6"
      >
        <div className="relative flex items-center justify-between">
          <IconButton
            icon={ChevronLeftIcon}
            onClick={() => (isLoggedIn ? router.back() : router.push('/'))}
          />
          {isLoggedIn ? (
            <IconButton
              icon={MenuIcon}
              onClick={() => router.push('/meu-perfil')}
              aria-label="Menu"
            />
          ) : (
            <div className="size-11" />
          )}
        </div>
      </header>

      <div className="px-4 pb-4 max-w-4xl mx-auto">
        {/* título na página, não no header */}
        <h1 className="text-foreground font-medium text-3xl leading-9 tracking-tight">
          Perguntas Frequentes
        </h1>
        <p className="text-foreground-light text-sm leading-5 mb-5">
          Escolha um dos assuntos abaixo ou pesquise na barra de busca para
          encontrar respostas de forma rápida
        </p>

        {/* search bar com ícone de lupa */}
        <div className="flex h-14 items-center rounded-full bg-card px-4 gap-3">
          <SearchIcon className="h-5 w-5 shrink-0 text-foreground" />
          <input
            ref={inputRef}
            type="search"
            placeholder="O que você precisa?"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 min-w-0 bg-transparent border-0 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-0 [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="shrink-0 text-card-foreground"
              aria-label="Limpar busca"
            >
              <XIcon className="h-6 w-6 text-card-foreground" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4 max-w-4xl mx-auto">
        {/* idle state */}
        {!hasQuery && !isSearching && (
          <nav className="mt-2">
            {NAV_ITEMS.map((item, i) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between py-5 text-foreground hover:text-primary transition-colors ${
                  i < NAV_ITEMS.length - 1 ? 'border-b border-border' : ''
                }`}
              >
                <span className="text-sm font-normal leading-5">
                  {item.label}
                </span>
                <ChevronRightIcon className="h-5 w-5 text-primary shrink-0" />
              </Link>
            ))}
          </nav>
        )}

        {/* spinner while debouncing */}
        {isSearching && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}

        {/* results */}
        {hasQuery && !isSearching && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-foreground/50">
            Nenhum resultado para &ldquo;{debouncedQuery}&rdquo;
          </p>
        )}

        {hasQuery && !isSearching && groups.length > 0 && (
          <div className="mt-2">
            {groups.map((group, gIdx) => (
              <section key={group.source}>
                {/* divider pontilhado entre grupos de fontes diferentes */}
                {gIdx > 0 && (
                  <div className="my-8 border-t-2 border-dashed border-border" />
                )}

                {groups.length > 1 && (
                  <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
                    {group.label}
                  </h2>
                )}

                <div className="space-y-8">
                  {group.items.map((item, i) => (
                    <div key={item.id}>
                      <div
                        role="link"
                        tabIndex={0}
                        onClick={() =>
                          router.push(
                            `${SOURCE_HREF[group.source]}#${item.originalId}&highlight=${encodeURIComponent(debouncedQuery.trim())}`
                          )
                        }
                        onKeyDown={e =>
                          e.key === 'Enter' &&
                          router.push(
                            `${SOURCE_HREF[group.source]}#${item.originalId}&highlight=${encodeURIComponent(debouncedQuery.trim())}`
                          )
                        }
                        className="block space-y-2 hover:opacity-80 transition-opacity cursor-pointer"
                      >
                        <h3 className="text-base font-medium leading-snug">
                          <Highlighted
                            text={item.title}
                            query={debouncedQuery.trim()}
                          />
                        </h3>
                        <FormattedContent
                          content={item.content}
                          query={debouncedQuery.trim()}
                        />
                      </div>
                      {i < group.items.length - 1 && (
                        <div className="mt-8 border-t border-border" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

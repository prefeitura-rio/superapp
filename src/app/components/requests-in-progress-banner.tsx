'use client'

import { ChevronRightIcon } from '@/assets/icons'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000

function isRecent(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() <= FIFTEEN_DAYS_MS
}

const CARD_CLASS = 'mx-4 mt-2 h-14.5 shrink-0 rounded-2xl'

export function RequestsInProgressBannerSkeleton() {
  return <div className={`${CARD_CLASS} bg-card animate-pulse`} />
}

export default function RequestsInProgressBanner() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const authRes = await fetch('/api/user/auth-status')
        const { isLoggedIn } = await authRes.json()
        if (!isLoggedIn) {
          setLoading(false)
          return
        }

        const res = await fetch('/api/chamados')
        if (!res.ok) {
          setLoading(false)
          return
        }

        const data = await res.json()
        const protocolos: any[] = data?.protocolos ?? []

        let total = 0
        for (const protocolo of protocolos) {
          for (const os of protocolo.ordens_de_servico ?? []) {
            const isOpen = os.status === 'Aberto'
            const recentlyUpdated = isRecent(protocolo.dataUltimaAtualizacao)
            if (isOpen || recentlyUpdated) total++
          }
        }

        if (total > 0) setCount(total)
      } catch {
        // silently ignore — banner is optional
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) return <RequestsInProgressBannerSkeleton />
  if (count === null) return null

  const label =
    count === 1
      ? 'Você possui **1 solicitação** para acompanhar.'
      : `Você possui **${count} solicitações** para acompanhar.`

  const [before, bold, after] = label.split('**')

  return (
    <Link href="/minhas-solicitacoes">
      <div
        className={`${CARD_CLASS} flex items-center justify-between gap-3 bg-card px-4 cursor-pointer hover:bg-secondary transition-colors`}
      >
        <p className="text-sm text-foreground-light leading-5">
          {before}
          <span className="text-foreground font-normal">{bold}</span>
          {after}
        </p>
        <ChevronRightIcon className="h-4 w-4 text-foreground-light shrink-0" />
      </div>
    </Link>
  )
}
